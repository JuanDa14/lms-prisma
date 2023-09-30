'use client';

import { useState } from 'react';
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { Chapter, Course } from '@prisma/client';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChaptersList } from './chapters-list';

interface ChaptersFormProps {
	initialData: Course & { chapters: Chapter[] };
	courseId: string;
}

const formSchema = z.object({
	title: z.string().min(1, {
		message: 'Title is required',
	}),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
	const [isCreating, setIsCreating] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const router = useRouter();

	const toogleCreating = () => setIsCreating((currentValue) => !currentValue);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await axios.post(`/api/courses/${courseId}/chapters`, values);
			router.refresh();
			toogleCreating();
			toast.success('Chapter created');
		} catch {
			toast.error('Something went wrong');
		}
	};

	const onReorder = async (updateData: { id: string; position: number }[]) => {
		try {
			setIsUpdating(true);

			await axios.put(`/api/courses/${courseId}/chapters/reorder`, {
				list: updateData,
			});

			toast.success('Chapters reordered');
			router.refresh();
		} catch {
			toast.error('Something went wrong');
		} finally {
			setIsUpdating(false);
		}
	};

	const onEdit = async (id: string) => {
		router.push(`/teacher/courses/${courseId}/chapters/${id}`);
	};

	return (
		<div className='relative mt-6 border bg-slate-100 rounded-md p-4'>
			{isUpdating && (
				<div className='absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center'>
					<Loader2 className='animate-spin h-6 w-6 text-sky-700' />
				</div>
			)}
			<div className='font-medium flex items-center justify-between'>
				Course chapters
				<Button variant={'ghost'} onClick={toogleCreating}>
					{isCreating ? (
						<>Cancel</>
					) : (
						<>
							<PlusCircle className='h-4 w-4 mr-2' />
							Add a chapter
						</>
					)}
				</Button>
			</div>

			{isCreating && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='title'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											placeholder='e.g Introduction'
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='mt-4 flex items-center gap-x-2'>
							<Button type='submit' disabled={isSubmitting || !isValid}>
								Create
							</Button>
						</div>
					</form>
				</Form>
			)}

			<div>
				{!isCreating && (
					<div
						className={cn(
							'text-sm mt-2',
							!initialData.chapters.length && 'text-slate-500 italic'
						)}
					>
						{!initialData.chapters.length && 'No chapters'}
						<ChaptersList
							onEdit={onEdit}
							onReorder={onReorder}
							items={initialData.chapters || []}
						/>
					</div>
				)}
				{!isCreating && (
					<p className='text-xs text-muted-foreground mt-4'>
						Drap and drop to reorder chapters
					</p>
				)}
			</div>
		</div>
	);
};
