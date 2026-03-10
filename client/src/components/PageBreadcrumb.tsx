import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbSegment[];
  className?: string;
}

export default function PageBreadcrumb({ items, className = "" }: PageBreadcrumbProps) {
  const { t, dir } = useI18n();
  const isRtl = dir === "rtl";
  const SeparatorIcon = isRtl ? ChevronLeft : ChevronRight;

  const allItems: BreadcrumbSegment[] = [
    { label: t("nav.home"), href: "/" },
    ...items,
  ];

  return (
    <div className={`bg-gray-50/80 border-b border-gray-100 ${className}`} dir={dir}>
      <div className="container-padding py-3">
        <Breadcrumb>
          <BreadcrumbList className="text-xs tracking-wide">
            {allItems.map((item, index) => {
              const isLast = index === allItems.length - 1;
              return (
                <span key={index} className="inline-flex items-center gap-1.5">
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <SeparatorIcon className="w-3 h-3 text-gray-300" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage
                        className="text-brand-blue font-medium"
                        data-testid={`breadcrumb-current`}
                      >
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.href || "/"}
                          data-testid={`breadcrumb-link-${index}`}
                        >
                          <span className="text-gray-500 hover:text-brand-gold transition-colors cursor-pointer inline-flex items-center gap-1">
                            {index === 0 && <Home className="w-3 h-3" />}
                            {item.label}
                          </span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
