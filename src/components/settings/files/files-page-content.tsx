import { m } from '@/locale/paraglide/messages';
import { FilesTable } from '@/components/settings/files/files-table';
import {
  useDeleteUserFile,
  useUploadUserFile,
  useUserFiles,
} from '@/hooks/use-user-files';
import { toast } from 'sonner';
import { useState } from 'react';
export function FilesPageContent() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useUserFiles(page, pageSize);
  const uploadMutation = useUploadUserFile();
  const deleteMutation = useDeleteUserFile();
  const handleUpload = (params: {
    file: File;
    isPublic?: boolean;
    description?: string;
  }) =>
    new Promise<void>((resolve, reject) => {
      uploadMutation.mutate(params, {
        onSuccess: () => {
          toast.success(m.settings_files_upload_success());
          resolve();
        },
        onError: (err) => {
          toast.error(m.settings_files_upload_error());
          reject(err);
        },
      });
    });
  const deleteFeedback = {
    onSuccess: () => toast.success(m.settings_files_delete_success()),
    onError: () => toast.error(m.settings_files_delete_error()),
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      deleteFeedback.onSuccess();
    } catch {
      deleteFeedback.onError();
    }
  };
  return (
    <div className="grid gap-3">
      {deleteMutation.isError ? (
        <p
          role="alert"
          data-file-delete-feedback="error"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {m.settings_files_delete_error()}
        </p>
      ) : null}
      <FilesTable
        data={data?.items ?? []}
        summary={data?.summary}
        total={data?.total ?? 0}
        pageIndex={page}
        pageSize={pageSize}
        loading={isLoading}
        uploading={uploadMutation.isPending}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
        onDelete={handleDelete}
        onUpload={handleUpload}
      />
    </div>
  );
}
