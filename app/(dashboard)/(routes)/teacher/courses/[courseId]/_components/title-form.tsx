'use client';

import { useState } from 'react';
import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TitleFormProps {
	initialData: {
		title: string;
	};
	courseId: string;
}

const formSchema = z.object({
	title: z.string().min(1, {
		message: 'Title is required',
	}),
});

export const TitleForm = ({ initialData, courseId }: TitleFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const router = useRouter();

	const toogleEdit = () => setIsEditing((currentValue) => !currentValue);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: initialData.title,
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await axios.patch(`/api/courses/${courseId}`, values);
			router.refresh();
			toogleEdit();
			toast.success('Course updated');
		} catch {
			toast.error('Something went wrong');
		}
	};

	return (
		<div className='mt-6 border bg-slate-100 rounded-md p-4'>
			<div className='font-medium flex items-center justify-between'>
				Course title
				<Button variant={'ghost'} onClick={toogleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<Pencil className='h-4 w-4 mr-2' />
							Edit title
						</>
					)}
				</Button>
			</div>
			{!isEditing && <p className='text-sm mt-2'>{initialData.title}</p>}
			{isEditing && (
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
											placeholder='e.g "Intro to Computer Science"'
											disabled={isSubmitting}
										/>
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
