'use client';

import { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';

import { useDebounce } from '@/hooks/use-debounce';
import { Input } from './ui/input';

export const SearchInput = () => {
	const [value, setValue] = useState('');

	const debounceValue = useDebounce(value);

	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const currentCategoryId = searchParams.get('categoryId');

	useEffect(() => {
		const url = qs.stringifyUrl(
			{
				url: pathname,
				query: {
					categoryId: currentCategoryId,
					title: debounceValue,
				},
			},
			{ skipNull: true, skipEmptyString: true }
		);

		router.push(url);
	}, [debounceValue, currentCategoryId, router, pathname]);

	return (
		<div className='relative'>
			<SearchIcon className='h-4 w-4 absolute top-3 left-3 text-slate-600' />
			<Input
				onChange={(e) => setValue(e.target.value)}
				value={value}
				className='w-full md:w-[300px] pl-9 rounded-full bg-slate-200 focus-visible:ring-slate-200'
				placeholder='Search for courses'
			/>
		</div>
	);
};
