"use client";

import { useState } from "react";
import { PlusCircle, ListChecks } from "lucide-react";
import CreateProblemPointModal from "./CreateProblemPointModal";
import ManageProblemPointModal from "./ManageProblemPointModal";
import { Session } from "@/lib/types/session";

interface ProblemPointPageClientProps {
  session: Session;
}

const ProblemPointPageClient = ({ session }: ProblemPointPageClientProps) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
              <PlusCircle className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Problem Points Management
            </h1>
            <p className="text-red-100">
              Manage student behavioral records and problem points
            </p>
          </div>

          {/* Action Cards */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Button */}
              <button
                onClick={() => setCreateModalOpen(true)}
                className="group relative bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-2 border-red-200 hover:border-red-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <PlusCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Create Record
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Assign new problem points to one or multiple students for
                    disciplinary actions, lateness, or other issues.
                  </p>
                </div>
              </button>

              {/* Mange Button */}
              <button
                onClick={() => setManageModalOpen(true)}
                className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                    <ListChecks className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Manage Records
                  </h2>
                  <p className="text-gray-600 text-sm">
                    View history, update existing records, or remove incorrect
                    entries. Filter by class and student.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateProblemPointModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        session={session}
      />
      <ManageProblemPointModal
        open={manageModalOpen}
        onOpenChange={setManageModalOpen}
        session={session}
      />
    </div>
  );
};

export default ProblemPointPageClient;
