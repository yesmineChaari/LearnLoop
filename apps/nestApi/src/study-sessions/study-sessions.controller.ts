import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Patch,
    Query,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Res,
    ParseUUIDPipe,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CreateStudySessionDto } from './dto/create-study-session.dto';
import { StudySessionResponseDto, toStudySessionResponseDto } from './dto/study-session-response.dto';
import { StudySessionStatusEnum } from './study-session.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { DocumentResponseDto, toDocumentResponseDto } from './dto/document-response.dto';
import { Response } from 'express';
import { ListStudySessionsQueryDto } from './dto/list-study-sessions.query.dto';
import { EnsureFriendsGuard } from './guards/ensure-friends.guard';

@Controller('study-sessions')
@UseGuards(JwtGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class StudySessionsController {
    constructor(private readonly service: StudySessionsService) { }

    @Post()
    @UseGuards(EnsureFriendsGuard)
    async create(@Body() dto: CreateStudySessionDto, @Req() req: any): Promise<StudySessionResponseDto> {
        const userId = req.user.id;
        const created = await this.service.create(dto, userId);
        return toStudySessionResponseDto(created);
    }

    @Patch(':id/confirm')
    @UseGuards(EnsureFriendsGuard)
    async confirm(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any): Promise<StudySessionResponseDto> {
        const userId = req.user.id;
        const updated = await this.service.confirm(id, userId);
        return toStudySessionResponseDto(updated);
    }

    @Patch(':id/cancel')
    async cancel(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any): Promise<StudySessionResponseDto> {
        const userId = req.user.id;
        const updated = await this.service.cancel(id, userId);
        return toStudySessionResponseDto(updated);
    }

    @Get()
    async list(@Query() { status }: ListStudySessionsQueryDto, @Req() req: any): Promise<StudySessionResponseDto[]> {
        const userId = req.user.id;

        if (!status) {
            const items = await this.service.listByStatus(userId, StudySessionStatusEnum.PENDING);
            return items.map(toStudySessionResponseDto);
        }

        if (status === 'all') {
            const all = await this.service.listAllForUser(userId);
            return all.map(toStudySessionResponseDto);
        }

        const items = await this.service.listByStatus(userId, status as StudySessionStatusEnum);
        return items.map(toStudySessionResponseDto);
    }

    @Get(':id')
    async getById(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any): Promise<StudySessionResponseDto> {
        const userId = req.user.id;
        const session = await this.service.getById(id);
        if (!session) throw new NotFoundException('Session not found');
        if (session.creator.id !== userId && session.participant.id !== userId) {
            throw new ForbiddenException('Not authorized to view this session');
        }
        return toStudySessionResponseDto(session);
    }

    @Post(':id/upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: join(process.cwd(), 'apps', 'nestApi', 'uploads'),
                filename: (_, file, cb) => {
                    const unique = Date.now() + extname(file.originalname);
                    cb(null, String(unique));
                },
            }),
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter: (_, file, cb) => {
                const mimeOk = /^(application\/(pdf|x-pdf))(;|$)/i.test(file.mimetype || '');
                const extOk = /\.pdf$/i.test(file.originalname || '');
                cb(null, mimeOk || extOk);
            },
        }),
    )
    async uploadFile(
        @Param('id', new ParseUUIDPipe()) id: string,
        @UploadedFile() file: any,
        @Req() req: any,
    ): Promise<DocumentResponseDto> {
        if (!file) throw new BadRequestException('Only PDF files are allowed');

        const userId = req.user.id;
        const created = await this.service.attachDocument(id, file, userId);
        return toDocumentResponseDto(created);
    }

    @Get(':id/documents/:docId/download')
    async download(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Param('docId', new ParseUUIDPipe()) docId: string,
        @Req() req: any,
        @Res() res: Response,
    ) {
        const userId = req.user.id;
        await this.service.ensureCanAccessSession(id, userId);
        const doc = await this.service.getDocumentOrThrow(docId);
        if (doc.session.id !== id) throw new NotFoundException('Document not found in session');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
        return res.download(doc.path);
    }
}
