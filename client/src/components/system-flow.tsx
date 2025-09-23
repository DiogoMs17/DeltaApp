"use client";

import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { AnimatedBeam, Circle, Icons } from "@/components/ui/animated-beam";
import logoImg from "@/components/image (2).png"; // ajuste o caminho relativo correto

export default function SystemFlow({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pandoraRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);
  const tsRef = useRef<HTMLDivElement>(null);
  const reactRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);
  const approvalRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Processamento Interno da Aplicação
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Após obter os dados do Pandora, a aplicação central processa tudo e
          distribui a lógica para os módulos que compõem o sistema
        </p>
      </div>

      <div
        className={cn(
          "relative flex w-full max-w-[600px] mx-auto items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl",
          className,
        )}
        ref={containerRef}
      >
        <div className="flex h-full w-full flex-row items-center justify-between gap-16">
          <div className="flex flex-col justify-center">
            <div className="text-center">
              <Circle ref={pandoraRef} className="mb-2">
                <Icons.database />
              </Circle>
              <span className="text-xs font-medium text-gray-700">Pandora</span>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-center">
              <Circle
                ref={appRef}
                size="lg"
                className="mb-2 border-corporate bg-red-50"
              >
                <img
                  src={logoImg}
                  alt="Logo App Central"
                  className="w-8 h-8 object-contain"
                />
              </Circle>
              <span className="text-xs font-medium text-gray-700">
                App Central
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <div className="text-center">
              <Circle ref={tsRef} className="mb-1">
                <Icons.typescript />
              </Circle>
              <span className="text-xs text-gray-600">Análise</span>
            </div>

            <div className="text-center">
              <Circle ref={calculatorRef} className="mb-1">
                <Icons.calculator />
              </Circle>
              <span className="text-xs text-gray-600">Cálculo</span>
            </div>

            <div className="text-center">
              <Circle ref={alertRef} className="mb-1">
                <Icons.alertTriangle />
              </Circle>
              <span className="text-xs text-gray-600">Alertas</span>
            </div>

            <div className="text-center">
              <Circle ref={approvalRef} className="mb-1">
                <Icons.checkCircle2 />
              </Circle>
              <span className="text-xs text-gray-600">Aprovação</span>
            </div>

            <div className="text-center">
              <Circle ref={reactRef} className="mb-1">
                <Icons.reactjs />
              </Circle>
              <span className="text-xs text-gray-600">Interface</span>
            </div>
          </div>
        </div>

        {/* Conexões animadas */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={pandoraRef}
          toRef={appRef}
          duration={3}
          curvature={0}
          gradientStartColor="#3B82F6"
          gradientStopColor="#1D4ED8"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={appRef}
          toRef={tsRef}
          duration={3}
          curvature={20}
          gradientStartColor="#EF4444"
          gradientStopColor="#DC2626"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={appRef}
          toRef={calculatorRef}
          duration={3}
          curvature={10}
          gradientStartColor="#10B981"
          gradientStopColor="#059669"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={appRef}
          toRef={alertRef}
          duration={3}
          curvature={0}
          gradientStartColor="#F59E0B"
          gradientStopColor="#D97706"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={appRef}
          toRef={approvalRef}
          duration={3}
          curvature={-10}
          gradientStartColor="#8B5CF6"
          gradientStopColor="#7C3AED"
        />
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={appRef}
          toRef={reactRef}
          duration={3}
          curvature={-20}
          gradientStartColor="#06B6D4"
          gradientStopColor="#0891B2"
        />
      </div>
    </div>
  );
}
