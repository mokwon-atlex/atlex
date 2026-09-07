import {
  ImageIcon,
  Upload,
  UserRound,
} from "lucide-react"

import { Image } from "@/components/common/ui/image"

/** @type { import('@storybook/nextjs-vite').Meta<typeof Image> } */
const meta = {
  title: "Common/UI/Image",
  component: Image,
  tags: ["autodocs"],

  argTypes: {
    shape: {
      control: "select",
      options: ["sharp", "square", "circle"],
    },

    size: {
      control: "select",
      options: ["sm", "default", "lg", "wide"],
    },
  },
}

export default meta

export const Default = {
  args: {},
}

export const Sharp = {
  args: {
    shape: "sharp",
  },
}

export const UploadBox = {
  args: {
    icon: <Upload className="size-8" />,
  },
}

export const Profile = {
  args: {
    shape: "circle",
    icon: <UserRound className="size-8" />,
  },
}

export const Wide = {
  args: {
    size: "wide",
    icon: <ImageIcon className="size-8" />,
  },
}

export const AllTypes = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Image />

      <Image
        shape="sharp"
      />

      <Image
        icon={<Upload className="size-8" />}
      />

      <Image
        shape="circle"
        icon={<UserRound className="size-8" />}
      />

      <Image
        size="wide"
        icon={<ImageIcon className="size-8" />}
      />
    </div>
  ),
}