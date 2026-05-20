const express = require('express');
const router = express.Router();

const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Story Tracker API',
        version: '1.0.0',
        description: 'RESTful API for the Story Tracker writing management application',
        contact: { name: 'Story Tracker' }
    },
    servers: [{ url: '/api', description: 'API base path' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: { error: { type: 'string' } }
            },
            Story: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    genre: { type: 'string' },
                    current_words: { type: 'integer' },
                    target_words: { type: 'integer' },
                    last_edited: { type: 'string', format: 'date-time' }
                }
            },
            StoryStats: {
                type: 'object',
                properties: {
                    storyId: { type: 'integer' },
                    title: { type: 'string' },
                    totalWordCount: { type: 'integer' },
                    targetWordCount: { type: 'integer' },
                    completionPercentage: { type: 'number' },
                    chapterCount: { type: 'integer' },
                    characterCount: { type: 'integer' },
                    estimatedReadingTimeMinutes: { type: 'integer' }
                }
            },
            Character: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    story_id: { type: 'integer' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    trait: { type: 'string' },
                    status: { type: 'string', enum: ['Alive', 'Dead', 'Unknown'] },
                    description: { type: 'string' }
                }
            },
            Lore: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    story_id: { type: 'integer' },
                    category: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        '/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password'],
                                properties: {
                                    username: { type: 'string', minLength: 1 },
                                    password: { type: 'string', minLength: 6 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Account created successfully' },
                    400: { description: 'Invalid input', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } } },
                    409: { description: 'Username already taken' }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login and receive a JWT token',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password'],
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                        username: { type: 'string' },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Invalid credentials' }
                }
            }
        },
        '/stories': {
            get: {
                tags: ['Stories'],
                summary: 'Get all stories for the authenticated user',
                responses: {
                    200: { description: 'List of stories', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Story' } } } } }
                }
            },
            post: {
                tags: ['Stories'],
                summary: 'Create a new story',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    title: { type: 'string' },
                                    genre: { type: 'string' },
                                    target_words: { type: 'integer', default: 80000 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Story created', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'integer' } } } } } },
                    400: { description: 'Title is required' }
                }
            }
        },
        '/stories/{id}': {
            get: {
                tags: ['Stories'],
                summary: 'Get a single story by ID',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Story data', content: { 'application/json': { schema: { '$ref': '#/components/schemas/Story' } } } },
                    404: { description: 'Story not found' }
                }
            },
            put: {
                tags: ['Stories'],
                summary: 'Update a story',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    content: { type: 'string' },
                                    current_words: { type: 'integer' },
                                    title: { type: 'string' },
                                    genre: { type: 'string' },
                                    target_words: { type: 'integer' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Story updated' },
                    404: { description: 'Story not found' }
                }
            },
            delete: {
                tags: ['Stories'],
                summary: 'Delete a story',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Story deleted' },
                    404: { description: 'Story not found' }
                }
            }
        },
        '/stories/{id}/stats': {
            get: {
                tags: ['Statistics'],
                summary: 'Get statistics for a story',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Story statistics', content: { 'application/json': { schema: { '$ref': '#/components/schemas/StoryStats' } } } },
                    404: { description: 'Story not found' }
                }
            }
        },
        '/stories/{storyId}/hub/characters': {
            get: {
                tags: ['Characters'],
                summary: 'Get all characters for a story',
                parameters: [{ name: 'storyId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'List of characters', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Character' } } } } }
                }
            },
            post: {
                tags: ['Characters'],
                summary: 'Add a character to a story',
                parameters: [{ name: 'storyId', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name'],
                                properties: {
                                    name: { type: 'string' },
                                    role: { type: 'string', default: 'Supporting' },
                                    trait: { type: 'string' },
                                    status: { type: 'string', default: 'Alive' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Character created' },
                    400: { description: 'Name is required' }
                }
            }
        },
        '/stories/{storyId}/hub/characters/{charId}': {
            delete: {
                tags: ['Characters'],
                summary: 'Delete a character',
                parameters: [
                    { name: 'storyId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'charId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Character deleted' },
                    404: { description: 'Character not found' }
                }
            }
        },
        '/stories/{storyId}/hub/lore': {
            get: {
                tags: ['Lore'],
                summary: 'Get all lore entries for a story',
                parameters: [{ name: 'storyId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'List of lore entries', content: { 'application/json': { schema: { type: 'array', items: { '$ref': '#/components/schemas/Lore' } } } } }
                }
            },
            post: {
                tags: ['Lore'],
                summary: 'Add a lore entry to a story',
                parameters: [{ name: 'storyId', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title'],
                                properties: {
                                    title: { type: 'string' },
                                    category: { type: 'string', default: 'General' },
                                    content: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Lore entry created' },
                    400: { description: 'Title is required' }
                }
            }
        },
        '/stories/{storyId}/hub/lore/{loreId}': {
            delete: {
                tags: ['Lore'],
                summary: 'Delete a lore entry',
                parameters: [
                    { name: 'storyId', in: 'path', required: true, schema: { type: 'integer' } },
                    { name: 'loreId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: { description: 'Lore entry deleted' },
                    404: { description: 'Lore entry not found' }
                }
            }
        },
        '/search': {
            get: {
                tags: ['Search'],
                summary: 'Search across stories, characters, and lore',
                parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'Search query' }],
                responses: {
                    200: {
                        description: 'Search results',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        stories: { type: 'array', items: { '$ref': '#/components/schemas/Story' } },
                                        characters: { type: 'array', items: { '$ref': '#/components/schemas/Character' } },
                                        lore: { type: 'array', items: { '$ref': '#/components/schemas/Lore' } }
                                    }
                                }
                            }
                        }
                    },
                    400: { description: 'Query parameter q is required' }
                }
            }
        }
    }
};

// Serve OpenAPI JSON spec
router.get('/json', (req, res) => {
    res.json(openApiSpec);
});

// Serve Swagger UI (loaded from CDN)
router.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Story Tracker — API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    body { margin: 0; background: #1a1918; }
    .swagger-ui .topbar { background-color: #262422; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/api/docs/json',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
      deepLinking: true
    });
  </script>
</body>
</html>`);
});

module.exports = router;
