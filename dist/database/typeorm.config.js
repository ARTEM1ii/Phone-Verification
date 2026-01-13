"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormConfig = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
exports.typeormConfig = {
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
};
exports.default = new typeorm_1.DataSource(exports.typeormConfig);
//# sourceMappingURL=typeorm.config.js.map