"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import PandoraConnection from "@/components/pandora-connection";
import SystemFlow from "@/components/system-flow";
import { Icons } from "@/components/ui/animated-beam";
import { GraduationCap, Briefcase } from "lucide-react";

interface HowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-corporate mb-2">
            Como Funciona o Sistema?
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Sistema de Precificação com Repasse Automatizado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Part 1: Pandora Database Connection */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 rounded-xl p-6 border border-gray-200 shadow-lg">
            <PandoraConnection />
          </div>

          {/* Part 2: Internal System Processing */}
          <div className="bg-gradient-to-br from-red-50 via-white to-blue-50 rounded-xl p-6 border border-gray-200 shadow-lg">
            <SystemFlow />
          </div>

          {/* Step-by-Step Process Explanation */}
          {/* Step-by-Step Process Explanation */}
          <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 rounded-xl p-4 md:p-8 border border-gray-200 shadow-lg">
            <h3 className="text-lg md:text-xl font-semibold mb-6 text-center text-gray-800">
              Processo Detalhado do Sistema
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-600 text-lg">Monitoramento Contínuo</h4>
                    <p className="text-gray-700 mt-2">
                      O sistema verifica periodicamente o banco de dados oficial de insumos 
                      em busca de alterações nos valores, garantindo detecção automática de mudanças.
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      <strong>Tecnologia:</strong> Sincronização em tempo real com banco corporativo
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-green-600 text-lg">Cálculo de Variação</h4>
                    <p className="text-gray-700 mt-2">
                      Quando detectado aumento significativo, o sistema calcula automaticamente 
                      o peso do insumo no custo total e avalia se gera impacto relevante no preço final.
                    </p>
                    <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                      <strong>Algoritmo:</strong> Análise de impacto percentual automática
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.0 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-orange-600 text-lg">Pendência de Repasse</h4>
                    <p className="text-gray-700 mt-2">
                      Se o impacto for relevante, uma pendência de aprovação é gerada automaticamente,
                      notificando administradores para tomada de decisão sobre o repasse de custo.
                    </p>
                    <div className="mt-2 p-2 bg-orange-50 rounded text-sm text-orange-700">
                      <strong>Critério:</strong> Limiar configurável de impacto significativo
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-6">
                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-purple-600 text-lg">Ação Administrativa</h4>
                    <p className="text-gray-700 mt-2">
                      O administrador pode deferir ou indeferir o repasse através da interface,
                      conforme critérios internos da empresa e estratégia comercial.
                    </p>
                    <div className="mt-2 p-2 bg-purple-50 rounded text-sm text-purple-700">
                      <strong>Controle:</strong> Decisão humana estratégica preservada
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-600 text-lg">Histórico/Auditoria</h4>
                    <p className="text-gray-700 mt-2">
                      Registro completo para análise
                    </p>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Compliance:</strong> Auditoria completa de todas as decisões
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center bg-gradient-to-r from-corporate/10 to-red-100 rounded-xl p-8 border-2 border-corporate/20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.6 }}
          >
            <h3 className="text-2xl font-bold text-corporate mb-3">
              Sistema em fase de desenvolvimento
            </h3>
            <p className="text-gray-700 mb-4 text-lg">
              Atualmente, o sistema está sincronizado com um arquivo local que
              simula o banco de dados corporativo. Por esse motivo, ainda podem
              ocorrer alguns erros ou divergências nos valores apresentados.
              Apesar disso, o sistema já está funcional para fins de visualização.
            </p>
            <div className="bg-white rounded-lg p-4 shadow-inner border border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-corporate">
                <Icons.checkCircle2 />
                <span className="font-bold">Visão Técnica:</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                O sistema será sincronizado com o banco corporativo MySQL e
                monitorará automaticamente as variações de preços, garantindo que
                nenhuma mudança significativa passe despercebida.
              </p>
            </div>
          </motion.div>

          {/* Eu sei que alguém em algum dia vai apagar isso, mas eu digo que tentei*/}
          <div className="mt-8 text-center text-gray-500 text-sm border-t pt-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>
                  Elaborado e desenvolvido por{" "}
                  <span className="font-medium text-gray-700">Diogo Moraes</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-700" />
                <span>
                  Revisado e aprovado por{" "}
                  <span className="font-medium text-gray-700">Edgar Nogueira</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
