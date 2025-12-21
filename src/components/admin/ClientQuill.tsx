"use client";

import { useSyncExternalStore } from "react";
import Editor, { EditorProvider } from "react-simple-wysiwyg";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

interface ClientQuillProps {
  value: string;
  onChange: (value: string) => void;
  modules?: any; // Kept for compatibility, though unused in simple editor
  placeholder?: string;
  className?: string;
}

export function ClientQuill({ value, onChange, placeholder, className }: ClientQuillProps) {
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isClient) {
    return <div className="h-[200px] w-full bg-muted animate-pulse rounded-md" />;
  }

  function handleChange(e: any) {
    onChange(e.target.value);
  }

  return (
    <div className={className}>
      <EditorProvider>
        <Editor 
          value={value} 
          onChange={handleChange}
          placeholder={placeholder}
          containerProps={{ style: { height: '100%', minHeight: '200px' } }}
        />
      </EditorProvider>
    </div>
  );
}
