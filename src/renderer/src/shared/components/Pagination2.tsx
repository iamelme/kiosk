import { ReactNode } from "react";
import { SetURLSearchParams } from "react-router-dom";
import Button from "./ui/Button";
import { ChevronsLeft, ChevronsRight } from "react-feather";

type Props = {
  pageSize: number;
  paginateSize: number;
  total: number;
  currentPage: number;
  searchParams: URLSearchParams;
  onSearchParams: SetURLSearchParams;
};

export default function Pagination2({
  pageSize,
  paginateSize,
  total,
  currentPage = 0,
  searchParams,
  onSearchParams,
}: Props): ReactNode {
  const median = Math.ceil(paginateSize / 2) - 1;

  const totalPage = Math.ceil(total / pageSize);

  // console.log({ totalPage, median, paginateSize, currentPage });

  return (
    <div className="flex items-center justify-between">
      <div>
        <strong>Total: {totalPage}</strong>
      </div>
      <nav>
        <ul className="flex gap-x-1">
          {currentPage > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSearchParams({
                  ...searchParams,
                  currentPage: String(0),
                })
              }
            >
              <ChevronsLeft size={14} />
            </Button>
          )}

          {new Array(paginateSize).fill(0).map((_, idx) => {
            const offset = idx - median + currentPage;
            // console.log({ offset, idx });
            if (idx >= totalPage || offset > totalPage) return;

            if (currentPage > median) {
              if (idx === median) {
                return (
                  <Button key={idx} disabled>
                    {currentPage + 1}
                  </Button>
                );
              }

              return (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onSearchParams({
                      ...searchParams,
                      currentPage: String(offset),
                    })
                  }
                >
                  {offset + 1}
                </Button>
              );
            } else {
              if (idx === currentPage) {
                return (
                  <Button key={idx} disabled>
                    {currentPage + 1}
                  </Button>
                );
              }
              return (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onSearchParams({
                      ...searchParams,
                      currentPage: String(idx),
                    })
                  }
                >
                  {idx + 1}
                </Button>
              );
            }
          })}

          {currentPage !== totalPage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSearchParams({
                  ...searchParams,
                  currentPage: String(totalPage),
                })
              }
            >
              <ChevronsRight size={14} />
            </Button>
          )}
        </ul>
      </nav>
    </div>
  );
}
