import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import { db } from '@/lib/db';

export async function PATCH(
	req: Request,
	{ params }: { params: { courseId: string; chapterId: string } }
) {
	try {
		const { userId } = auth();

		if (!userId) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const ownCourse = await db.course.findUnique({
			where: {
				userId,
				id: params.courseId,
			},
		});

		if (!ownCourse) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const chapter = await db.chapter.findUnique({
			where: {
				courseId: params.courseId,
				id: params.chapterId,
			},
		});

		const muxData = await db.muxData.findUnique({
			where: {
				chapterId: params.chapterId,
			},
		});

		if (!chapter || !muxData || !chapter.title || !chapter.description || !chapter.videoUrl) {
			return new NextResponse('Missing required fields', { status: 400 });
		}

		const publishChapter = await db.chapter.update({
			where: {
				id: params.chapterId,
				courseId: params.courseId,
			},
			data: {
				isPublished: true,
			},
		});

		return NextResponse.json(publishChapter);
	} catch (error) {
		console.log('[COURSEID CHAPTERS PUBLISH]', error);
		return new NextResponse('Internal Server Error', { status: 500 });
	}
}
