import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { HelpCircle } from 'lucide-react';

export function QuestionsList({ questions }: { questions: string[] }) {
    if (!questions || questions.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-[#2BA84A]" />
                    Clarifying Questions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm text-[#2D3A3A]">
                    {questions.map((q, idx) => (
                        <li key={idx}>{q}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
