'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Clock, ChevronDown, ChevronRight, GripVertical, Eye, EyeOff } from 'lucide-react';
import type { ContentItem } from '@/app/admin/page';
import { ContentEditor } from './ContentEditor';

interface ContentManagerProps {
  contentItems: ContentItem[];
}

const CATEGORIES = [
  { slug: 'problem-clarity', label: 'Problem Clarity' },
  { slug: 'customer-understanding', label: 'Customer Understanding' },
  { slug: 'product-development', label: 'Product Development' },
  { slug: 'traction-validation', label: 'Traction & Validation' },
  { slug: 'execution-consistency', label: 'Execution Consistency' },
  { slug: 'team-building', label: 'Team Building' },
  { slug: 'founder-identity', label: 'Founder Identity' },
];

function getCategoryLabel(slug: string): string {
  return CATEGORIES.find(c => c.slug === slug)?.label || slug;
}

function getCategoryColor(slug: string): string {
  switch (slug) {
    case 'problem-clarity':
      return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
    case 'customer-understanding':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'product-development':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    case 'traction-validation':
      return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
    case 'execution-consistency':
      return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
    case 'team-building':
      return 'bg-pink-500/20 text-pink-600 border-pink-500/30';
    case 'founder-identity':
      return 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  }
}

function getFormatColor(format: string): string {
  switch (format) {
    case 'lesson':
      return 'bg-primary/20 text-primary border-primary/30';
    case 'article':
      return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
    case 'story':
      return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
    case 'debate':
      return 'bg-red-500/20 text-red-600 border-red-500/30';
    case 'conversation':
      return 'bg-green-500/20 text-green-600 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
  }
}

function ContentRow({
  item,
  onEdit,
  onDelete
}: {
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="px-4 py-3 flex items-center gap-4">
        <div className="text-muted-foreground cursor-grab">
          <GripVertical className="size-5" />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground"
        >
          {isExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-mono">#{item.display_order}</span>
            <h3 className="font-medium text-foreground">{item.title}</h3>
            {!item.is_published && (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                <EyeOff className="size-3 mr-1" />
                Draft
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="outline" className={getFormatColor(item.format)}>
            {item.format}
          </Badge>

          <Badge variant="outline" className={getCategoryColor(item.category_slug)}>
            {getCategoryLabel(item.category_slug)}
          </Badge>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {item.estimated_duration_minutes} min
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" onClick={() => onEdit(item)}>
              <Edit className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t px-4 py-4 bg-muted/20 space-y-4">
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Intro</h4>
            <p className="text-sm text-foreground whitespace-pre-line">{item.content?.intro || 'No intro'}</p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Quick Breakdown ({item.content?.quickBreakdown?.length || 0} points)</h4>
            <div className="space-y-2">
              {item.content?.quickBreakdown?.map((point, index) => (
                <div key={index} className="bg-background rounded-lg p-3 border">
                  <div className="font-medium text-sm text-foreground">{point.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{point.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Remember This</h4>
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="font-medium text-sm text-primary">{item.content?.rememberThis?.title}</div>
              <div className="text-sm text-foreground mt-1">{item.content?.rememberThis?.content}</div>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Slug: <code className="bg-muted px-1 rounded">{item.slug}</code></span>
            <span>Author: {item.author}</span>
            <span>Tags: {item.tags?.join(', ') || 'None'}</span>
            <span>Premium: {item.is_premium ? 'Yes' : 'No'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ContentManager({ contentItems }: ContentManagerProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [items, setItems] = useState(contentItems);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const response = await fetch('/api/content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });

      if (response.ok) {
        setItems(items.filter(i => i.id !== item.id));
      } else {
        alert('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleSave = (savedItem: ContentItem) => {
    if (editingItem) {
      setItems(items.map(i => i.id === savedItem.id ? savedItem : i));
    } else {
      setItems([...items, savedItem]);
    }
    setIsEditorOpen(false);
    setEditingItem(null);
  };

  const handleClose = () => {
    setIsEditorOpen(false);
    setEditingItem(null);
  };

  // Group by category
  const categoryCounts = CATEGORIES.map(cat => ({
    ...cat,
    count: items.filter(i => i.category_slug === cat.slug).length,
  }));

  return (
    <div className="space-y-6">
      {/* Category Summary */}
      <div className="flex flex-wrap gap-2">
        {categoryCounts.map(cat => (
          <Badge
            key={cat.slug}
            variant="outline"
            className={`${getCategoryColor(cat.slug)} cursor-pointer`}
          >
            {cat.label} ({cat.count})
          </Badge>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {items.length} total lessons · {items.filter(i => i.is_published).length} published
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="size-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Content List */}
      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <ContentRow
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">No content items found</p>
            <Button onClick={handleAddNew}>
              <Plus className="size-4 mr-2" />
              Add Your First Lesson
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <ContentEditor
          item={editingItem}
          onSave={handleSave}
          onClose={handleClose}
          nextDisplayOrder={items.length + 1}
        />
      )}
    </div>
  );
}
