import { useData } from "../lib/data-context";

export function useInitializeOptions() {
  // handled by data context and backend now
}

export function useCustomOptions(type: 'platform' | 'mediaType') {
  const { customOptionsDB, addCustomOption, editCustomOption, deleteCustomOption, checkOptionInUse } = useData();
  
  const options = customOptionsDB.filter(o => o.type === type);

  const addOption = async (name: string) => {
    await addCustomOption(name, type);
  };

  const editOption = async (oldValue: string, newName: string) => {
    await editCustomOption(oldValue, newName, type);
  };

  const deleteOption = async (value: string, replacementValue: string | undefined) => {
    await deleteCustomOption(value, replacementValue, type);
  };

  const checkInUse = async (value: string) => {
    return checkOptionInUse(value, type);
  };

  return { options, addOption, editOption, deleteOption, checkInUse };
}
