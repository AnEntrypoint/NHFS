'use client';

// TODO: Add multiple file selection feature.

import path from 'path';

import Link from 'next/link';
import {
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Dropdown,
} from '@heroui/dropdown';
import { addToast } from '@heroui/toast';
import { useRouter } from 'next/navigation';
import { Input } from '@heroui/input';
import { useRef, useState, useTransition } from 'react';
import { Button } from '@heroui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/modal';
import clsx from 'clsx';

import {
  CopyIcon,
  CutIcon,
  DeleteIcon,
  DownloadIcon,
  InfoIcon,
  MenuDotsIcon,
  RenameIcon,
} from '@/components/icons';
import { DirEntry, FileEntry } from '@/types';
import IconMap from '@/components/FileIconMap';
import { useClipboard } from '@/hooks/ClipboardContext';
import { copyFileAction, deleteFileAction } from '@/app/actions';
import { FileErrorMap } from '@/types/fileErrors';
import { FileInfoModal } from '@/components/FileInfoModal';
import { modal } from '@/components/sharedStyles';

export default function FilesList({ files }: { files: DirEntry }) {
  return (
    <ul className="flex flex-col gap-2">
      {files.children.map(file => (
        <li
          key={file.path.toString()}
          className="flex flex-row justify-between overflow-hidden rounded-md bg-content2/75 pl-4 hover:bg-content2 dark:bg-content1/75 hover:dark:bg-content1"
        >
          <LeftWrapper
            href={path.join('/', file.path.toString())}
            icon={IconMap(file.type)}
            title={file.name}
          />
          <RightWrapper file={file} />
        </li>
      ))}
    </ul>
  );
}

const LeftWrapper = ({
  title,
  href,
  icon,
}: {
  title: string;
  href: string;
  icon: JSX.Element;
}) => {
  return (
    <div className="flex w-[90%] flex-row items-center gap-2 py-2">
      <div className="size-4">{icon}</div>
      <Link className="truncate text-sm font-light hover:underline" href={href}>
        {title}
      </Link>
    </div>
  );
};

const RightWrapper = ({ file }: { file: DirEntry['children'][number] }) => {
  const { copy } = useClipboard();
  const router = useRouter();
  const [newFilename, setNewFilename] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isRenaming, startRenameTransaction] = useTransition();
  const [isDeleting, startDeleteTransaction] = useTransition();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFileInfoModalOpen, setIsFileInfoModalOpen] = useState(false);
  const downloadButtonRef = useRef<HTMLAnchorElement>(null);

  const copyHandler = (
    file: DirEntry | FileEntry,
    { move }: { move: boolean } = { move: false },
  ) => {
    copy({
      path: file.path,
      name: file.name,
      mode: move ? 'move' : 'copy',
    });
    addToast({
      title: move ? 'Cut' : 'Copied',
      color: 'default',
      icon: move ? <CutIcon size={20} /> : <CopyIcon size={20} />,
    });
  };

  const deleteHandler = async (file: DirEntry | FileEntry) => {
    startDeleteTransaction(async () => {
      const result = await deleteFileAction(file.path);

      if (result.ok) {
        addToast({
          title: 'Deleted',
          color: 'default',
          icon: <DeleteIcon />,
        });
        router.refresh();
        setIsDeleteModalOpen(false);
      } else {
        addToast({
          title: 'Error deleting file',
          color: 'danger',
          description:
            FileErrorMap[result.error]?.message || FileErrorMap.UNKNOWN.message,
          icon: <DeleteIcon />,
        });
      }
    });
  };

  async function renameHandler(file: FileEntry) {
    const originalName = file.name;
    const filePath = file.path;
    const dirname = file.parentPath;

    if (originalName === newFilename || newFilename === '') {
      setIsRenameModalOpen(false);

      return;
    }
    startRenameTransaction(async () => {
      const result = await copyFileAction(
        filePath,
        `${dirname}/${newFilename}`,
        { move: true },
      );

      if (!result.ok) {
        addToast({
          title: 'Error renaming file',
          color: 'danger',
          description: FileErrorMap[result.error]?.message,
          icon: <RenameIcon size={20} />,
        });
      } else {
        router.refresh();
        setIsRenameModalOpen(false);
      }
    });
  }

  return (
    <div className="flex flex-row items-center">
      <a
        ref={downloadButtonRef}
        className="hidden"
        href={path.join('/', file.path) + '?dl=true'}
      >
        download
      </a>
      <Dropdown backdrop="blur">
        <DropdownTrigger className="active:border-none">
          <div className="flex size-full w-8 cursor-pointer items-center justify-center hover:bg-content2/70">
            <MenuDotsIcon
              className="rotate-90 text-default-500 focus:outline-none"
              focusable={false}
              weight="Bold"
            />
          </div>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownSection>
            {file.type !== 'dir' ? (
              <DropdownItem
                key="download"
                className="hover:bg-primary-50"
                startContent={<DownloadIcon />}
                onPress={() => {
                  downloadButtonRef.current?.click();
                }}
              >
                Download
              </DropdownItem>
            ) : (
              <></>
            )}

            <DropdownItem
              key="copy"
              className="select-none"
              // description={`Copy ${fileType} to`}
              closeOnSelect={false}
              startContent={
                <div className="h-4 w-4">
                  <CopyIcon />
                </div>
              }
              onPress={() => {
                copyHandler(file);
              }}
            >
              Copy
            </DropdownItem>

            <DropdownItem
              key="move"
              className="select-none"
              closeOnSelect={false}
              // description={`Move ${fileType} to`}
              startContent={
                <div className="h-4 w-4">
                  <CutIcon />
                </div>
              }
              onPress={() => {
                copyHandler(file, { move: true });
              }}
            >
              Move
            </DropdownItem>
            <DropdownItem
              key="rename"
              className="select-none"
              startContent={
                <div className="h-4 w-4">
                  <RenameIcon />
                </div>
              }
              onPress={() => setIsRenameModalOpen(true)}
            >
              Rename
            </DropdownItem>
          </DropdownSection>
          <DropdownSection showDivider title="Danger Zone">
            <DropdownItem
              key="delete"
              className="text-danger-500"
              color="danger"
              startContent={<DeleteIcon />}
              variant="solid"
              onPress={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </DropdownItem>
          </DropdownSection>
          <DropdownSection>
            <DropdownItem
              key="info"
              // description="File information"
              startContent={<InfoIcon />}
              onPress={() => setIsFileInfoModalOpen(true)}
            >
              Info
            </DropdownItem>
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
      <FileInfoModal
        file={file}
        isOpen={isFileInfoModalOpen}
        onClose={() => setIsFileInfoModalOpen(false)}
      />
      <Modal
        hideCloseButton
        backdrop="blur"
        classNames={{ base: modal?.base }}
        isOpen={isDeleteModalOpen}
        motionProps={{
          variants: {
            enter: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
          },
          transition: { duration: 0.2 },
        }}
      >
        <ModalContent className="rounded-xl border border-divider shadow-xl">
          <ModalHeader className="flex flex-col gap-1">
            Delete File
            <span className="text-sm font-normal text-default-500">
              This action is irreversible. You sure about this?
            </span>
          </ModalHeader>

          <ModalBody>
            <div className="flex items-center gap-3 p-1">
              <span className="text-lg">🗑️</span>
              <span className="text-base">
                <strong>{file.name}</strong> will be permanently deleted.
              </span>
            </div>
          </ModalBody>

          <ModalFooter>
            <Button
              className="text-default-500"
              variant="light"
              onPress={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={isDeleting}
              onPress={() => deleteHandler(file)}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        hideCloseButton
        backdrop="blur"
        classNames={{ base: clsx(modal?.base) }}
        isOpen={isRenameModalOpen}
      >
        <ModalContent className="rounded-xl shadow-xl">
          <ModalHeader className="flex flex-col gap-1">
            Rename File
            <span className="text-sm font-normal text-default-500">
              Give your file a new identity 👀
            </span>
          </ModalHeader>

          <ModalBody>
            <Input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              className="font-mono font-normal"
              classNames={{
                inputWrapper: [
                  'bg-content1/70',
                  'hover:bg-content1',
                  'group-data-[focus=true]:bg-content1',
                  'group-data-[hover=true]:bg-content2',
                ],
                innerWrapper: 'bg-transparent hover:bg-transparent',
                input: 'bg-transparent, hover:bg-transparent',
              }}
              defaultValue={file.name}
              placeholder="Enter new name"
              radius="lg"
              size="lg"
              spellCheck="false"
              startContent={<RenameIcon size={18} />}
              variant="flat"
              onValueChange={text => setNewFilename(text)}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              className="text-default-500"
              variant="light"
              onPress={() => setIsRenameModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isRenaming}
              onPress={() => {
                renameHandler(file);
              }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
