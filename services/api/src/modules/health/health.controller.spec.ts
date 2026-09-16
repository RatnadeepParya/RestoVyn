import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { HealthCheckService, PrismaHealthIndicator } from "@nestjs/terminus";
import { PrismaService } from "../../core/prisma/prisma.service";

describe("HealthController", () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockImplementation((indicators) =>
              Promise.resolve({
                status: "ok",
                info: { database: { status: "up" } },
                error: {},
                details: { database: { status: "up" } },
              }),
            ),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest
              .fn()
              .mockResolvedValue({ database: { status: "up" } }),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return liveness status", () => {
    const result = controller.liveness();
    expect(result.status).toBe("ok");
    expect(result.timestamp).toBeDefined();
  });

  it("should return readiness status", () => {
    const result = controller.readiness();
    expect(result.status).toBe("ready");
    expect(result.timestamp).toBeDefined();
  });

  it("should run health check", async () => {
    const result = await controller.check();
    expect(result.status).toBe("ok");
    expect(result.details.database.status).toBe("up");
  });
});
