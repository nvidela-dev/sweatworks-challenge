import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sweatworks Fitness API',
      version: '1.0.0',
      description: 'API for managing gym members, memberships, plans, and check-ins',
    },
    servers: [
      {
        url: '/api',
        description: 'API server',
      },
    ],
    components: {
      schemas: {
        Member: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', nullable: true },
            isDeleted: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MemberProfile: {
          type: 'object',
          properties: {
            member: { $ref: '#/components/schemas/Member' },
            activeMembership: {
              allOf: [{ $ref: '#/components/schemas/Membership' }],
              nullable: true,
            },
            lastCheckIn: { type: 'string', format: 'date-time', nullable: true },
            checkInsLast30Days: { type: 'integer' },
          },
        },
        CreateMemberInput: {
          type: 'object',
          required: ['firstName', 'lastName', 'email'],
          properties: {
            firstName: { type: 'string', minLength: 1 },
            lastName: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
          },
        },
        Plan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'string' },
            durationDays: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Membership: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            memberId: { type: 'string', format: 'uuid' },
            planId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['active', 'cancelled', 'expired'] },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time', nullable: true },
            cancelledAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateMembershipInput: {
          type: 'object',
          required: ['memberId', 'planId'],
          properties: {
            memberId: { type: 'string', format: 'uuid' },
            planId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date' },
          },
        },
        CheckIn: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            memberId: { type: 'string', format: 'uuid' },
            membershipId: { type: 'string', format: 'uuid' },
            checkedInAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateCheckInInput: {
          type: 'object',
          required: ['memberId'],
          properties: {
            memberId: { type: 'string', format: 'uuid' },
            checkedInAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            pageSize: { type: 'integer' },
            totalCount: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                      code: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/**/*.router.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
