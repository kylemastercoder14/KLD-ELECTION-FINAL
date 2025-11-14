"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface RichTextEditorProps {
  value: string;
  onChangeAction: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChangeAction,
  placeholder = "Write something...",
  disabled = false,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChangeAction(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false }); // prevents dispatching a transaction
    }
  }, [editor, value]);

  const applyLink = () => {
    if (!editor) return;
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
  };

  const applyImage = () => {
    if (!editor || imageUrl === "") return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageDialogOpen(false);
    setImageUrl("");
  };

  if (!editor) return null;

  return (
    <TooltipProvider>
      <div className="border rounded-md">
        <div className="flex flex-wrap gap-1 p-1 border-b">
          {[
            {
              icon: <Bold className="h-4 w-4" />,
              label: "Bold",
              action: () => editor.chain().focus().toggleBold().run(),
              active: editor.isActive("bold"),
            },
            {
              icon: <Italic className="h-4 w-4" />,
              label: "Italic",
              action: () => editor.chain().focus().toggleItalic().run(),
              active: editor.isActive("italic"),
            },
            {
              icon: <UnderlineIcon className="h-4 w-4" />,
              label: "Underline",
              action: () => editor.chain().focus().toggleUnderline().run(),
              active: editor.isActive("underline"),
            },
            {
              icon: <Heading1 className="h-4 w-4" />,
              label: "Heading 1",
              action: () =>
                editor.chain().focus().toggleHeading({ level: 1 }).run(),
              active: editor.isActive("heading", { level: 1 }),
            },
            {
              icon: <Heading2 className="h-4 w-4" />,
              label: "Heading 2",
              action: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
              active: editor.isActive("heading", { level: 2 }),
            },
            {
              icon: <Heading3 className="h-4 w-4" />,
              label: "Heading 3",
              action: () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
              active: editor.isActive("heading", { level: 3 }),
            },
            {
              icon: <List className="h-4 w-4" />,
              label: "Bullet List",
              action: () => editor.chain().focus().toggleBulletList().run(),
              active: editor.isActive("bulletList"),
            },
            {
              icon: <ListOrdered className="h-4 w-4" />,
              label: "Ordered List",
              action: () => editor.chain().focus().toggleOrderedList().run(),
              active: editor.isActive("orderedList"),
            },
          ].map((btn, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={btn.active}
                  onPressedChange={btn.action}
                  disabled={disabled}
                  aria-label={btn.label}
                >
                  {btn.icon}
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>{btn.label}</TooltipContent>
            </Tooltip>
          ))}

          {/* Link Dialog */}
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("link")}
                    onPressedChange={() => {
                      const previousUrl =
                        editor.getAttributes("link").href || "";
                      setLinkUrl(previousUrl);
                      setLinkDialogOpen(true);
                    }}
                    disabled={disabled}
                    aria-label="Add link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Link</TooltipContent>
              </Tooltip>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Link</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <DialogFooter>
                <Button onClick={applyLink}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Image Dialog */}
          <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setImageDialogOpen(true)}
                    disabled={disabled}
                    aria-label="Insert Image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Image</TooltipContent>
              </Tooltip>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Image</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <DialogFooter>
                <Button onClick={applyImage}>Insert</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="ml-auto flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo() || disabled}
                  className="h-8 px-2"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo() || disabled}
                  className="h-8 px-2"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <EditorContent editor={editor} placeholder={placeholder} className="p-3 max-h-[200px] overflow-y-auto" />
      </div>
    </TooltipProvider>
  );
}
