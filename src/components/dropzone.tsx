import { cn } from '@/lib/utils'
import { type UseSupabaseUploadReturn } from '@/hooks/use-supabase-upload'
import { Button } from '@/components/ui/button'
import { CheckCircle, File, Loader2, Upload, X } from 'lucide-react'
import { createContext, type PropsWithChildren, useCallback, useContext, type MouseEvent } from 'react'
import * as React from 'react'

// File object er type definition jate build er somoy TypeScript error na dey
interface UploadFile extends globalThis.File {
    preview?: string
    size: number
    errors: Array<{ message: string }>
}

export const formatBytes = (
    bytes: number,
    decimals = 2,
    size?: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB'
) => {
    const k = 1000
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    if (bytes === 0 || bytes === undefined) return size !== undefined ? `0 ${size}` : '0 bytes'
    const i = size !== undefined ? sizes.indexOf(size) : Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Omit er sathe custom typed files bypass kora holo
type DropzoneContextType = Omit<UseSupabaseUploadReturn, 'getRootProps' | 'getInputProps' | 'files'> & {
    files: UploadFile[]
}

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined)

type DropzoneProps = Omit<UseSupabaseUploadReturn, 'files'> & {
    files: UploadFile[]
    className?: string
}

const Dropzone = ({
    className,
    children,
    getRootProps,
    getInputProps,
    ...restProps
}: PropsWithChildren<DropzoneProps>) => {
    const isSuccess = restProps.isSuccess
    const isActive = restProps.isDragActive
    const isInvalid =
        (restProps.isDragActive && restProps.isDragReject) ||
        (restProps.errors.length > 0 && !restProps.isSuccess) ||
        restProps.files.some((file) => file.errors?.length > 0)

    return (
        <DropzoneContext.Provider value={{ ...restProps }}>
            <div
                {...getRootProps({
                    className: cn(
                        'border-2 rounded-lg p-6 text-center bg-card transition-colors duration-300 text-foreground',
                        isSuccess ? 'border-solid border-primary bg-primary/5' : 'border-dashed border-gray-300',
                        isActive && 'border-primary bg-primary/10',
                        isInvalid && 'border-destructive bg-destructive/10',
                        className
                    ),
                })}
            >
                <input {...getInputProps()} />
                {children}
            </div>
        </DropzoneContext.Provider>
    )
}

const DropzoneContent = ({ className }: { className?: string }) => {
    const {
        files,
        setFiles,
        onUpload,
        loading,
        successes,
        errors,
        maxFileSize,
        maxFiles,
        isSuccess,
    } = useDropzoneContext()

    const exceedMaxFiles = files.length > maxFiles

    const handleRemoveFile = useCallback(
        (fileName: string) => {
            setFiles(files.filter((file) => file.name !== fileName))
        },
        [files, setFiles]
    )

    if (isSuccess) {
        return (
            <div className={cn('flex flex-row items-center gap-x-2 justify-center py-4', className)}>
                <CheckCircle size={18} className="text-primary animate-scale-in" />
                <p className="text-primary text-sm font-medium">
                    Successfully uploaded {files.length} file{files.length > 1 ? 's' : ''}
                </p>
            </div>
        )
    }

    return (
        <div className={cn('flex flex-col w-full', className)}>
            {files.map((file, idx) => {
                const fileError = errors.find((e) => e.name === file.name)
                const isSuccessfullyUploaded = !!successes.find((e) => e === file.name)
                const hasErrors = file.errors && file.errors.length > 0

                return (
                    <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center gap-x-4 border-b py-3 first:mt-4 last:mb-4 last:border-b-0"
                    >
                        {file.type?.startsWith('image/') && file.preview ? (
                            <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                                <img src={file.preview} alt={file.name} className="object-cover h-full w-full" />
                            </div>
                        ) : (
                            <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center shrink-0">
                                <File size={18} className="text-muted-foreground" />
                            </div>
                        )}

                        <div className="shrink grow flex flex-col items-start truncate text-left">
                            <p title={file.name} className="text-sm font-medium truncate max-w-full text-foreground">
                                {file.name}
                            </p>
                            {hasErrors ? (
                                <p className="text-xs text-destructive mt-0.5 font-medium">
                                    {file.errors
                                        .map((e) =>
                                            e.message.startsWith('File is larger than')
                                                ? `File is larger than ${formatBytes(maxFileSize, 2)} (Size: ${formatBytes(file.size, 2)})`
                                                : e.message
                                        )
                                        .join(', ')}
                                </p>
                            ) : loading && !isSuccessfullyUploaded ? (
                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-x-1">
                                    <Loader2 size={12} className="animate-spin" /> Uploading file...
                                </p>
                            ) : !!fileError ? (
                                <p className="text-xs text-destructive mt-0.5 font-medium">Failed to upload: {fileError.message}</p>
                            ) : isSuccessfullyUploaded ? (
                                <p className="text-xs text-primary mt-0.5 font-medium">Successfully uploaded file</p>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-0.5">{formatBytes(file.size, 2)}</p>
                            )}
                        </div>

                        {!loading && !isSuccessfullyUploaded && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveFile(file.name)}
                                type="button"
                            >
                                <X size={16} />
                            </Button>
                        )}
                    </div>
                )
            })}

            {exceedMaxFiles && (
                <p className="text-sm text-left mt-2 text-destructive font-medium">
                    You may upload only up to {maxFiles} file{maxFiles > 1 ? 's' : ''}, please remove {files.length - maxFiles} file
                    {files.length - maxFiles > 1 ? 's' : ''}.
                </p>
            )}

            {files.length > 0 && !exceedMaxFiles && (
                <div className="mt-4 text-left">
                    <Button
                        variant="default"
                        onClick={onUpload}
                        disabled={files.some((file) => file.errors?.length > 0) || loading}
                        className="w-full sm:w-auto"
                        type="button"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>Upload files</>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}

const DropzoneEmptyState = ({ className }: { className?: string }) => {
    const { maxFiles, maxFileSize, inputRef, isSuccess } = useDropzoneContext()

    if (isSuccess) {
        return null
    }

    return (
        <div className={cn('flex flex-col items-center gap-y-2 py-4', className)}>
            <div className="p-3 bg-muted rounded-full">
                <Upload size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
                Upload {maxFiles && maxFiles > 0 ? `${maxFiles} ` : ''}file{!maxFiles || maxFiles > 1 ? 's' : ''}
            </p>
            <div className="flex flex-col items-center gap-y-1">
                <p className="text-xs text-muted-foreground">
                    Drag and drop or{' '}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            inputRef.current?.click()
                        }}
                        className="underline font-medium text-primary cursor-pointer transition hover:text-primary/80 bg-transparent border-0 p-0"
                    >
                        select {maxFiles === 1 ? 'file' : 'files'}
                    </button>{' '}
                    to upload
                </p>
                {maxFileSize !== Number.POSITIVE_INFINITY && maxFileSize > 0 && (
                    <p className="text-xs text-muted-foreground/80">
                        Maximum file size: {formatBytes(maxFileSize, 2)}
                    </p>
                )}
            </div>
        </div>
    )
}

const useDropzoneContext = () => {
    const context = useContext(DropzoneContext)

    if (!context) {
        throw new Error('useDropzoneContext must be used within a Dropzone')
    }

    return context
}

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext }