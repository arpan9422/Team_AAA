import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GearGuard API Documentation',
      version: '1.0.0',
      description: 'Team AAA - AI-Powered Maintenance Management System API',
      contact: {
        name: 'Team AAA',
        url: 'https://github.com/arpan9422/Team_AAA',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            role: {
              type: 'string',
              enum: ['EMPLOYEE', 'TECHNICIAN', 'MANAGER'],
              description: 'User role in the system',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether user account is active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 150,
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 100,
              example: 'password123',
            },
            role: {
              type: 'string',
              enum: ['EMPLOYEE', 'TECHNICIAN', 'MANAGER'],
              example: 'EMPLOYEE',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              example: 'password123',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful',
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token (expires in 1 hour)',
            },
            refreshToken: {
              type: 'string',
              description: 'JWT refresh token (expires in 7 days)',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        MaintenanceTeam: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Team unique identifier',
            },
            name: {
              type: 'string',
              description: 'Team name',
            },
            description: {
              type: 'string',
              description: 'Team description',
            },
            specialization: {
              type: 'string',
              description: 'Team specialization area',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether team is active',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Team creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Team last update timestamp',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Teams',
        description: 'Maintenance team management (Manager only)',
      },
      {
        name: 'Equipment',
        description: 'Equipment management endpoints (Manager only)',
      },
      {
        name: 'Maintenance Requests',
        description: 'Maintenance request management - Manager can reassign, reject assignments, and update priorities',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard statistics and analytics - Total equipment, active requests, completed, and overdue',
      },
      {
        name: 'Technician',
        description: 'Technician-specific endpoints for dashboard, history, and work management',
      },
    ],
  },
  apis: ['./src/modules/auth/*.ts', './src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
