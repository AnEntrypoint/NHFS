'use client';
/* TODO: Use `pathname` for breadcrumbs tree and get file stats.
   Breadcrumbs don't work when there's a wrong (404) path in the url or some other error.
   So it's better to render breadcrumbs according to the pathname as it provides better user experience.
*/
import path from 'path';

import {
  BreadcrumbItem,
  Breadcrumbs as HeroBreadcrumbs,
} from '@heroui/breadcrumbs';

import { FileIcon, FolderIcon, HomeIcon } from '@/components/icons';
import { BreadcrumbsItemsProps } from '@/types';

export default function BreadCrumbs({
  items,
}: {
  items: BreadcrumbsItemsProps;
}) {
  return (
    <HeroBreadcrumbs>
      <BreadcrumbItem
        key="ROOT"
        href="/"
        isCurrent={items.length < 1}
        startContent={<HomeIcon />}
      >
        {''}
      </BreadcrumbItem>
      {items.map(item => (
        <BreadcrumbItem
          key={item.name}
          href={path.join('/', item.path)}
          startContent={item.type === 'dir' ? <FolderIcon /> : <FileIcon />}
        >
          {item.name}
        </BreadcrumbItem>
      ))}
    </HeroBreadcrumbs>
  );
}
