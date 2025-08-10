// TODO: Use only svg icons. Migrate from solar icons to copy-pasted svg paths

import * as React from 'react';
import { IconProps, SSR as ServerIcons } from '@solar-icons/react';

const {
  FolderWithFiles,
  Settings,
  Upload,
  AddFolder,
  Folder,
  MenuDots,
  File,
  FileRight,
  FolderError,
  DangerCircle,
  Home,
  DownloadMinimalistic,
  TrashBinTrash,
  InfoCircle,
  Restart,
  FullScreen,
  Backspace,
  CloudUpload,
  CloseCircle,
  RestartCircle,
  FolderOpen,
} = ServerIcons;

import { IconSvgProps } from '@/types';

export const Logo = (props: IconProps) => {
  return <FolderWithFiles {...props} weight={props.weight || 'Outline'} />;
};

export const SettingsIcon = (props: IconProps) => {
  return (
    <Settings
      className="cursor-pointer hover:opacity-75"
      {...props}
      weight={props.weight || 'Outline'}
    />
  );
};

export const UploadIcon = (props: IconProps) => {
  return <Upload {...props} weight={props.weight || 'Outline'} />;
};

export const FolderIcon = (props: IconProps) => {
  return <Folder {...props} weight={props.weight || 'BoldDuotone'} />;
};

export const FolderOpenIcon = (props: IconProps) => {
  return <FolderOpen {...props} weight={props.weight || 'BoldDuotone'} />;
};

export const AddFolderIcon = (props: IconProps) => {
  return <AddFolder {...props} weight={props.weight || 'BoldDuotone'} />;
};

export const MenuDotsIcon = (props: IconProps) => {
  return <MenuDots {...props} weight={props.weight || 'Outline'} />;
};

export const FileIcon = (props: IconProps) => {
  return <File {...props} weight={props.weight || 'BoldDuotone'} />;
};

export const FileRightIcon = (props: IconProps) => {
  return <FileRight {...props} weight={props.weight || 'BoldDuotone'} />;
};

export const FolderErrorIcon = (props: IconProps) => {
  return <FolderError {...props} weight={props.weight || 'BoldDuotone'} />;
};

export const ErrorIcon = (props: IconProps) => {
  return <DangerCircle {...props} weight={props.weight || 'Outline'} />;
};

export const HomeIcon = (props: IconProps) => {
  return <Home {...props} weight={props.weight || 'Outline'} />;
};

export const DownloadIcon = (props: IconProps) => {
  return <DownloadMinimalistic {...props} weight={props.weight || 'Outline'} />;
};

export const DeleteIcon = (props: IconProps) => {
  return <TrashBinTrash {...props} weight={props.weight || 'Outline'} />;
};

export const InfoIcon = (props: IconProps) => {
  return <InfoCircle {...props} weight={props.weight || 'Outline'} />;
};

export const RestartIcon = (props: IconProps) => {
  return <Restart {...props} weight={props.weight || 'Outline'} />;
};
export const FullScreenIcon = (props: IconProps) => {
  return <FullScreen {...props} weight={props.weight || 'Outline'} />;
};

export const BackspaceIcon = (props: IconProps) => {
  return <Backspace {...props} weight={props.weight || 'Outline'} />;
};

export const UploadCloudIcon = (props: IconProps) => {
  return <CloudUpload {...props} weight={props.weight || 'Outline'} />;
};

export const CloseCircleIcon = (props: IconProps) => {
  return <CloseCircle {...props} weight={props.weight || 'Outline'} />;
};

export const RestartCircleIcon = (props: IconProps) => {
  return <RestartCircle {...props} weight={props.weight || 'Outline'} />;
};

export function CheckmarkIcon(props: IconProps) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.53 12.97a.75.75 0 0 0-1.06 1.06l4.5 4.5a.75.75 0 0 0 1.06 0l11-11a.75.75 0 0 0-1.06-1.06L8.5 16.94l-3.97-3.97Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m4.397 4.554.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l6.47-6.47a.75.75 0 1 1 1.06 1.061L13.061 12l6.47 6.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-6.47 6.47a.75.75 0 0 1-1.06-1.061L10.939 12l-6.47-6.47a.75.75 0 0 1-.072-.976l.073-.084-.073.084Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RenameIcon(props: IconSvgProps) {
  return (
    <svg
      fill="none"
      style={{ width: props.size || 'auto', height: props.size || 'auto' }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.75 2h3.998a.75.75 0 0 1 .102 1.493l-.102.007H12.5v17h1.245a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.648.743l-.102.007H9.75a.75.75 0 0 1-.102-1.493l.102-.007H11v-17H9.75a.75.75 0 0 1-.743-.648L9 2.75a.75.75 0 0 1 .648-.743L9.75 2h3.998H9.75Zm8.496 2.997a3.253 3.253 0 0 1 3.25 3.25l.004 7.504a3.249 3.249 0 0 1-3.064 3.246l-.186.005h-4.745v-1.5h4.803A1.749 1.749 0 0 0 20 15.751l-.003-7.505a1.753 1.753 0 0 0-1.752-1.75h-4.74v-1.5h4.74Zm-8.246 0v1.5H5.25a1.75 1.75 0 0 0-1.75 1.75v7.504c0 .967.784 1.75 1.75 1.75h4.745v1.5H5.25A3.25 3.25 0 0 1 2 15.751V8.247a3.25 3.25 0 0 1 3.25-3.25H10Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CopyIcon(props: IconSvgProps) {
  return (
    <svg
      fill="none"
      style={{ width: props.size || 'auto', height: props.size || 'auto' }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.503 4.627 5.5 6.75v10.504a3.25 3.25 0 0 0 3.25 3.25h8.616a2.251 2.251 0 0 1-2.122 1.5H8.75A4.75 4.75 0 0 1 4 17.254V6.75c0-.98.627-1.815 1.503-2.123ZM17.75 2A2.25 2.25 0 0 1 20 4.25v13a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-13A2.25 2.25 0 0 1 8.75 2h9Zm0 1.5h-9a.75.75 0 0 0-.75.75v13c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-13a.75.75 0 0 0-.75-.75Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function CutIcon(props: IconSvgProps) {
  return (
    <svg
      fill="none"
      style={{ width: props.size || 'auto', height: props.size || 'auto' }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.14 9.341v.002L7.37 2.328a.75.75 0 1 0-1.24.844l5.13 7.545-2.395 3.743a4 4 0 1 0 1.178.943l2.135-3.337 2.065 3.036a4 4 0 1 0 1.261-.813l-2.447-3.597.002-.002-.918-1.348Zm-7.64 8.66a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Zm10 0a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z"
        fill="currentColor"
      />
      <path
        d="m13.938 9.316 3.943-6.162a.75.75 0 1 0-1.263-.808L13.02 7.968l.918 1.348Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PasteIcon(props: IconSvgProps) {
  return (
    <svg
      fill="none"
      style={{ width: props.size || 'auto', height: props.size || 'auto' }}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.753 2c1.158 0 2.111.875 2.234 2h1.763a2.25 2.25 0 0 1 2.245 2.096L19 6.25a.75.75 0 0 1-.647.742L18.249 7a.75.75 0 0 1-.742-.647L17.5 6.25a.75.75 0 0 0-.648-.743L16.75 5.5h-2.132a2.244 2.244 0 0 1-1.865.993H9.247c-.777 0-1.461-.393-1.865-.992L5.25 5.5a.75.75 0 0 0-.743.648L4.5 6.25v13.505c0 .38.282.693.648.743l.102.007h3a.75.75 0 0 1 .743.647l.007.102a.75.75 0 0 1-.75.75h-3a2.25 2.25 0 0 1-2.245-2.095L3 19.755V6.25a2.25 2.25 0 0 1 2.096-2.245L5.25 4h1.763a2.247 2.247 0 0 1 2.234-2h3.506Zm5.997 6a2.25 2.25 0 0 1 2.245 2.096l.005.154v9.5a2.25 2.25 0 0 1-2.096 2.245L18.75 22h-6.5a2.25 2.25 0 0 1-2.245-2.096L10 19.75v-9.5a2.25 2.25 0 0 1 2.096-2.245L12.25 8h6.5Zm0 1.5h-6.5a.75.75 0 0 0-.743.648l-.007.102v9.5c0 .38.282.694.648.743l.102.007h6.5a.75.75 0 0 0 .743-.648l.007-.102v-9.5a.75.75 0 0 0-.648-.743L18.75 9.5Zm-5.997-6H9.247a.747.747 0 0 0 0 1.493h3.506a.747.747 0 1 0 0-1.493Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const DiscordIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const TwitterIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"
        fill="currentColor"
      />
    </svg>
  );
};

export const GithubIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
      fill="currentColor"
    />
  </svg>
);

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g fill="currentColor">
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
      <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
    </g>
  </svg>
);

export const HeartFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);
