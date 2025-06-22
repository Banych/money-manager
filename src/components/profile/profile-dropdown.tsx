import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserAvatar from '@/components/user-avatar';
import { User } from '@/generated/prisma';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { FC } from 'react';

type Props = {
  user: Pick<User, 'image' | 'name' | 'email'>;
};

const ProfileDropdown: FC<Props> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            image: user.image,
            name: user.name,
            email: user.email,
          }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-w-52">
        <DropdownMenuItem asChild>
          <Link
            href={`/profile/${user.name}`}
            className="flex flex-col items-start gap-1"
          >
            {user.name && (
              <span className="text-lg font-medium">{user.name}</span>
            )}
            {user.email && (
              <span className="truncate text-sm text-zinc-700">
                {user.email}
              </span>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            signOut({ callbackUrl: `${window.location.origin}/auth/signin` });
          }}
          className="cursor-pointer text-red-700 hover:text-red-700 focus:text-red-700"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
