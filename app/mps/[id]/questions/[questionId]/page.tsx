
import { db, MPQuestion } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
    questionId: string;
  }>;
}

export default async function QuestionDetailsPage({ params }: Props) {
  const { id, questionId } = await params;

  const questions = await db.getMpQuestions(id);

  const question = questions.find((q: MPQuestion) => q.id === questionId);

  if (!question) {
    notFound();
  }

  return (
    <div className="text-white p-10">
      <h1 className="text-3xl font-bold">
        {question.question_text}
      </h1>
    </div>
  );
}