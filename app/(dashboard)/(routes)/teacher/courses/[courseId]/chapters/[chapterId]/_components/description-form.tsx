'use client';

import { useState } from 'react';
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

import { Chapter } from '@prisma/client';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Editor } from '@/components/editor';
import { Preview } from '@/components/preview';

interface ChapterDescriptionFormProps {
	initialData: Chapter;
	courseId: string;
	chapterId: string;
}

const formSchema = z.object({
	description: z.string().min(1),
});

export const ChapterDescriptionForm = ({
	initialData,
	courseId,
	chapterId,
}: ChapterDescriptionFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const router = useRouter();

	const toogleEdit = () => setIsEditing((currentValue) => !currentValue);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			description: initialData?.description || '',
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
			router.refresh();
			toogleEdit();
			toast.success('Chapter updated');
		} catch {
			toast.error('Something went wrong');
		}
	};

	return (
		<div className='mt-6 border bg-slate-100 rounded-md p-4'>
			<div className='font-medium flex items-center justify-between'>
				Chapter description
				<Button variant={'ghost'} onClick={toogleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<Pencil className='h-4 w-4 mr-2' />
							Edit description
						</>
					)}
				</Button>
			</div>
			{!isEditing && (
				<div
					className={cn('text-sm mt-2', !initialData.description && 'text-slate-500 italic')}
				>
					{!initialData.description && 'No description'}
					{initialData.description && <Preview value={initialData.description} />}
				</div>
			)}
			{isEditing && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Editor {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='mt-4 flex items-center gap-x-2'>
							<Button type='submit' disabled={isSubmitting || !isValid}>
								Save
							</Button>
						</div>
					</form>
				</Form>
			)}
		</div>
	);
};
