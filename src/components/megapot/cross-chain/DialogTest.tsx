"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { Button } from "@/components/ui/inputs/button";

export function DialogTest() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8 bg-gray-800 rounded-lg">
      <h2 className="text-xl mb-4 text-white">Dialog Test Component</h2>
      <Button onClick={() => setOpen(true)}>Open Test Dialog</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="bg-gray-900 text-white border border-white/10"
          style={{ zIndex: 9999 }}
        >
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription className="text-white/70">
              This is a test dialog to verify functionality.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white">Dialog content goes here.</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Close Dialog</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
