'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { isConfigured, FirebasePromptRepository } from '@destiny-ai/database';
import { SystemPrompt, DEFAULT_REPORT_PROMPT, DEFAULT_CHAT_PROMPT } from '@destiny-ai/core';
import { Button, Card, Input, TextArea } from '@destiny-ai/ui';

const promptRepo = new FirebasePromptRepository();

export const PromptManager = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [typeFilter, setTypeFilter] = useState<'report_gen' | 'chat_consultant'>('report_gen');
  const [editPrompt, setEditPrompt] = useState<Partial<SystemPrompt>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isConfigured) return;
    const unsubscribe = promptRepo.subscribeToPrompts((data) => {
      setPrompts(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!editPrompt.content || !editPrompt.version) return;
    try {
      if (editPrompt.isActive) {
        const others = prompts.filter((p) => p.type === editPrompt.type && p.isActive);
        for (const p of others) {
          if (p.id) await promptRepo.updatePrompt(p.id, { isActive: false });
        }
      }
      await promptRepo.savePrompt({
        type: editPrompt.type || typeFilter,
        version: editPrompt.version,
        content: editPrompt.content,
        isActive: editPrompt.isActive || false,
        createdAt: new Date(),
      });
      setIsEditing(false);
      setEditPrompt({});
      toast.success('Prompt saved successfully!');
    } catch (e) {
      const error = e as Error;
      console.error(error);
      toast.error('Failed to save prompt');
    }
  };

  const activePrompt = prompts.find((p) => p.type === typeFilter && p.isActive);

  return (
    <div>
      <div className="flex gap-2.5 mb-5">
        <Button
          variant={typeFilter === 'report_gen' ? 'primary' : 'secondary'}
          onClick={() => setTypeFilter('report_gen')}
          className="w-auto"
        >
          Report Gen Prompts
        </Button>
        <Button
          variant={typeFilter === 'chat_consultant' ? 'primary' : 'secondary'}
          onClick={() => setTypeFilter('chat_consultant')}
          className="w-auto"
        >
          Chat Consultant Prompts
        </Button>
      </div>

      {isEditing ? (
        <Card title="Edit Prompt">
          <Input
            label="Version Label (e.g. v1.1)"
            value={editPrompt.version || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEditPrompt({ ...editPrompt, version: e.target.value })
            }
          />
          <TextArea
            label="System Prompt Content"
            value={editPrompt.content || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setEditPrompt({ ...editPrompt, content: e.target.value })
            }
            rows={15}
          />
          <div className="mb-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editPrompt.isActive || false}
                onChange={(e) => setEditPrompt({ ...editPrompt, isActive: e.target.checked })}
                className="cursor-pointer"
              />
              <span>Set as Active</span>
            </label>
          </div>
          <div className="flex gap-2.5">
            <Button onClick={handleSave}>Save Prompt</Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card title="Active Prompt" className="border-l-4 border-green-500">
            {activePrompt ? (
              <div>
                <strong>Version: {activePrompt.version}</strong>
                <pre className="whitespace-pre-wrap max-h-[100px] overflow-hidden bg-gray-100 p-2.5 rounded text-sm">
                  {activePrompt.content}
                </pre>
              </div>
            ) : (
              <p>No active prompt set. Using system defaults.</p>
            )}
            <Button
              onClick={() => {
                setEditPrompt({
                  type: typeFilter,
                  content: activePrompt
                    ? activePrompt.content
                    : typeFilter === 'report_gen'
                      ? DEFAULT_REPORT_PROMPT
                      : DEFAULT_CHAT_PROMPT,
                  version: 'v' + (prompts.filter((p) => p.type === typeFilter).length + 1) + '.0',
                  isActive: true,
                });
                setIsEditing(true);
              }}
              className="mt-2.5"
            >
              Create New Version
            </Button>
          </Card>
          <h4 className="mt-5 mb-2.5">Version History</h4>
          {prompts
            .filter((p) => p.type === typeFilter)
            .map((p) => (
              <div
                key={p.id}
                className="p-2.5 border-b border-gray-200 flex justify-between"
                style={{ opacity: p.isActive ? 1 : 0.6 }}
              >
                <span>
                  <strong>{p.version}</strong>{' '}
                  {p.isActive && <span className="text-green-600 font-bold">(Active)</span>}
                </span>
                <span className="text-xs text-gray-600">{p.id}</span>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

