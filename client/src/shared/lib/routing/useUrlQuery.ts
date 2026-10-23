import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

export const useUrlQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = useCallback(
    (
      updates: Record<string, string | null>,
      options: { replace?: boolean } = {},
    ) => {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);
          Object.entries(updates).forEach(([key, value]) => {
            if (value === null) nextParams.delete(key);
            else nextParams.set(key, value);
          });
          return nextParams;
        },
        { replace: options.replace ?? true },
      );
    },
    [setSearchParams],
  );

  return { searchParams, updateParams };
};
