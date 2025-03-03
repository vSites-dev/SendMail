import { Template } from "@prisma/client";
import Link from "next/link";
import { TemplateCard } from "@/components/ui/template-card";

export default function SablonokTable({
  templates,
}: {
  templates: Template[];
}) {
  return (
    // <div className="rounded-md border">
    //   <table className="w-full">
    //     <thead className="bg-muted/50">
    //       <tr>
    //         <th className="p-3 text-left text-sm font-medium">Név</th>
    //         <th className="p-3 text-left text-sm font-medium">Frissítve</th>
    //         <th className="p-3 text-left text-sm font-medium">Létrehozva</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {templates.map((template) => (
    //         <tr key={template.id} className="border-b hover:bg-muted/60">
    //           <td className="p-3">
    //             <Link
    //               href={`/sablonok/${template.id}`}
    //               className="hover:underline"
    //             >
    //               {template.name}
    //             </Link>
    //           </td>
    //           <td className="p-3">
    //             {template.updatedAt.toLocaleTimeString()}
    //           </td>
    //           <td className="p-3">
    //             {template.createdAt.toLocaleTimeString()}
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {templates.map((template) => (
        <Link key={template.id} href={`/sablonok/${template.id}`}>
          <TemplateCard
            title={template.name}
            description={template.createdAt.toLocaleTimeString()}
          />
        </Link>
      ))}
    </div>
  );
}
