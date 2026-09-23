'use client';

import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { usePersonal } from '@/lib/use-personal';
import PersonalPanel from '../personal-panel';

export default function AccountPage() {
  const account = usePersonal();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-8 sm:py-8">
        <header className="flex items-center justify-between gap-3 border-b pb-5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                BCIT Course Desk
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight">
                Your account
              </h1>
            </div>
          </Link>
          <Link
            href="/"
            className={buttonVariants({
              variant: 'outline',
              className: 'h-10 rounded-xl px-3',
            })}
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to deadlines</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </header>

        <div className="pt-6 sm:pt-8">
          <PersonalPanel {...account} />
        </div>
      </div>
    </main>
  );
}
