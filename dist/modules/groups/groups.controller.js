"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const groups_service_1 = require("./groups.service");
const create_group_dto_1 = require("./dto/create-group.dto");
const assign_teacher_dto_1 = require("./dto/assign-teacher.dto");
const add_student_dto_1 = require("./dto/add-student.dto");
const create_schedule_rule_dto_1 = require("./dto/create-schedule-rule.dto");
const generate_lessons_dto_1 = require("./dto/generate-lessons.dto");
const update_group_dto_1 = require("./dto/update-group.dto");
let GroupsController = class GroupsController {
    groupsService;
    constructor(groupsService) {
        this.groupsService = groupsService;
    }
    findAll(req) {
        return this.groupsService.findAll(req.user);
    }
    getOne(id, req) {
        return this.groupsService.getOne(id, req.user);
    }
    create(dto, req) {
        return this.groupsService.create(dto, req.user);
    }
    update(id, dto, req) {
        return this.groupsService.update(id, dto, req.user);
    }
    archive(id, req) {
        return this.groupsService.archive(id, req.user);
    }
    restore(id, req) {
        return this.groupsService.restore(id, req.user);
    }
    assignTeacher(id, dto, req) {
        return this.groupsService.assignTeacher(id, dto, req.user);
    }
    getStudents(id, req) {
        return this.groupsService.getStudents(id, req.user);
    }
    addStudent(id, dto, req) {
        return this.groupsService.addStudent(id, dto, req.user);
    }
    removeStudent(id, studentId, req) {
        return this.groupsService.removeStudent(id, studentId, req.user);
    }
    setScheduleRule(id, dto, req) {
        return this.groupsService.setScheduleRule(id, dto, req.user);
    }
    getLessons(id, from, to, req) {
        return this.groupsService.getLessons(id, from, to, req.user);
    }
    generateLessons(id, dto, req) {
        return this.groupsService.generateLessons(id, dto, req.user);
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_group_dto_1.UpdateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "archive", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)(':id/teacher'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_teacher_dto_1.AssignTeacherDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "assignTeacher", null);
__decorate([
    (0, common_1.Get)(':id/students'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Post)(':id/students'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_student_dto_1.AddStudentDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "addStudent", null);
__decorate([
    (0, common_1.Delete)(':id/students/:studentId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "removeStudent", null);
__decorate([
    (0, common_1.Post)(':id/schedule-rule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_schedule_rule_dto_1.CreateScheduleRuleDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "setScheduleRule", null);
__decorate([
    (0, common_1.Get)(':id/lessons'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "getLessons", null);
__decorate([
    (0, common_1.Post)(':id/generate-lessons'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, generate_lessons_dto_1.GenerateLessonsDto, Object]),
    __metadata("design:returntype", void 0)
], GroupsController.prototype, "generateLessons", null);
exports.GroupsController = GroupsController = __decorate([
    (0, swagger_1.ApiTags)('Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map