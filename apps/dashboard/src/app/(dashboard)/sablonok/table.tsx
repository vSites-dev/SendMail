import { Template } from "@prisma/client";
import Link from "next/link";

export default function SablonokTable({
  templates,
}: {
  templates: Template[];
}) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="p-3 text-left text-sm font-medium">Név</th>
            <th className="p-3 text-left text-sm font-medium">Frissítve</th>
            <th className="p-3 text-left text-sm font-medium">Létrehozva</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id}>
              <td className="border-b p-3">
                <Link
                  href={`/sablonok/${template.id}`}
                  className="hover:underline"
                >
                  {template.name}
                </Link>
              </td>
              <td className="border-b p-3">
                {template.updatedAt.toLocaleTimeString()}
              </td>
              <td className="border-b p-3">
                {template.createdAt.toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
