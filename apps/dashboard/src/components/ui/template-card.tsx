import { cn } from "@/lib/utils";

export const TemplateCard = ({
  title,
  description,
  Icon,
  selected,
}: {
  title: string;
  description: string;
  Icon?: React.ElementType;
  selected?: boolean;
}) => (
  <div className="relative">
    <div
      className={cn(
        "relative z-10 mt-0 block h-full w-full overflow-hidden hover:cursor-pointer",
        "transition-all duration-200 ease-in-out",
        "rounded-lg rounded-tr-[26px] bg-white px-4 pt-5 pb-[18px] shadow-[inset_0_0_0_1px] shadow-gray-200 before:absolute before:top-0 before:right-0 before:z-3 before:h-[30px] before:w-[30px] before:-translate-y-1/2 before:translate-x-1/2 before:rotate-45 before:bg-neutral-100 before:shadow-[0_1px_0_0_] before:shadow-gray-200 before:transition-all before:duration-200 before:ease-in-out before:content-[''] after:absolute after:top-0 after:right-0 after:z-2 after:size-7 after:-translate-y-2 after:translate-x-2 after:rounded-bl-lg after:border after:bg-neutral-100 after:shadow-xs after:transition-all after:duration-200 after:ease-in-out after:content-[''] hover:rounded-tr-[45px] hover:before:h-[50px] hover:before:w-[50px] hover:after:h-[42px] hover:after:w-[42px] hover:after:shadow-lg transition-all hover:after:shadow-black/5",
        selected && "after:bg-gradient-to-bl after:from-violet-600 after:to-violet-700"
      )}
    >
      <div>
        <div className="relative flex items-center gap-2">
          <div className="absolute -left-4 h-5 w-[3px] rounded-r-sm bg-violet-600" />
          {Icon && <Icon className="size-5 shrink-0 text-violet-600" />}
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <p className="mt-2 text-gray-600 sm:text-sm">{description}</p>
      </div>
    </div>
  </div>
);
