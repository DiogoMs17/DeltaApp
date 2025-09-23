'use client';

import { cn } from '@/lib/utils';
import React, { forwardRef, useRef } from 'react';
import { AnimatedBeam, Circle } from '@/components/ui/animated-beam';
import { Icons } from '@/components/ui/animated-beam';

export default function PandoraToApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const pandoraRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Pandora DB → Aplicação</h3>
        <p className="text-sm text-gray-600 mt-1">
          As alterações realizadas diretamente no banco Pandora são refletidas na aplicação em tempo real, sem necessidade de recarregar.
        </p>
      </div>

      <div
        className="relative flex w-full max-w-[500px] mx-auto items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl"
        ref={containerRef}
      >
        <div className="flex h-full w-full flex-row items-center justify-between gap-20">
          <div className="text-center">
            <Circle ref={pandoraRef} className="mb-2">
              <Icons.database />
            </Circle>
            <span className="text-xs font-medium text-gray-700">Pandora DB</span>
          </div>

          <div className="text-center">
            <Circle ref={appRef} className="mb-2">
              <Icons.user />
            </Circle>
            <span className="text-xs font-medium text-gray-700">Aplicação</span>
          </div>
        </div>

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={pandoraRef}
          toRef={appRef}
          curvature={30}
          dotted
          duration={3}
          gradientStartColor="#CC9B7A"
          gradientStopColor="#f5c7a8"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={appRef}
          toRef={pandoraRef}
          curvature={-30}
          reverse
          dotted
          duration={3}
          gradientStartColor="#3B82F6"
          gradientStopColor="#1D4ED8"
        />
      </div>
    </div>
  );
}
