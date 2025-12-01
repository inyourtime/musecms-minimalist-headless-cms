import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import type { ContentEntry } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
interface ContentCardProps {
  entry: ContentEntry;
}
export function ContentCard({ entry }: ContentCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg leading-tight pr-2">{entry.data.title || 'Untitled Entry'}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link to={`/editor/${entry.id}`} className="w-full"><Edit className="mr-2 h-4 w-4" /> Edit</Link></DropdownMenuItem>
              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Publish</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start ${entry.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
          {entry.status}
        </span>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">{entry.data.excerpt || 'No excerpt available.'}</p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(entry.updatedAt), { addSuffix: true })}
        </p>
      </CardFooter>
    </Card>
  );
}