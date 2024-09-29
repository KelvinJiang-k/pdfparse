'use client'

import { useToast } from '@/components/ui/use-toast'
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import { useResizeDetector } from 'react-resize-detector'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState } from 'react'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

import Simplebar from 'simplebar-react'
import PdfFullscreen from './PdfFullscreen'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface PdfRendererProps {
  url: string
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast()

  const [numPages, setNumPages] = useState<number>()
  const [currPage, setcurrPage] = useState<number>(1)
  const [scale, setScale] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== scale

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  })
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(CustomPageValidator),
  })

  const { width, ref } = useResizeDetector()

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setcurrPage(Number(page))
    setValue('page', String(page))
  }

  return (
    <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
      {/* pdf options */}
      <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
        <div className='flex items-center gap-1.5'>
          {/* previous page */}
          <Button
            variant='ghost'
            aria-label='previous page'
            onClick={() => {
              setcurrPage((prev) => {
                return prev - 1 > 1 ? prev - 1 : 1
              })
              setValue('page', String(currPage - 1))
            }}
            disabled={currPage <= 1}
          >
            <ChevronDown className='h-4 w-4' />
          </Button>

          {/* page selector */}
          <div className='flex items-center gap-1.5'>
            <Input
              {...register('page')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)()
                }
              }}
              className={cn(
                'w-12 h-8',
                errors.page && 'focus-visible:ring-red-500'
              )}
            />
            <p className='text-zinc-700 text-sm space-x-1'>
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>

          {/* next page */}
          <Button
            variant='ghost'
            aria-label='next page'
            onClick={() => {
              setcurrPage((prev) => {
                return prev + 1 > numPages! ? numPages! : prev + 1
              })
              setValue('page', String(currPage + 1))
            }}
            disabled={numPages === undefined || currPage === numPages}
          >
            <ChevronUp className='h-4 w-4' />
          </Button>
        </div>

        {/* zoom dropdown */}
        <div className='space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='gap-1.5' aria-label='zoom' variant='ghost'>
                <Search className='h-4 w-4' />
                {scale * 100}%<ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* rotate */}
        <Button
          onClick={() => {
            setRotation((prev) => {
              return prev + 90
            })
          }}
          aria-label='rotate 90 degrees'
          variant='ghost'
        >
          <RotateCw className='h-4 w-4' />
        </Button>

        {/* full screen */}
        <PdfFullscreen fileUrl={url} />
      </div>

      <div className='flex-1 w-full max-h-screen'>
        <Simplebar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
          <div ref={ref}>
            <Document
              loading={
                <div className='flex justify-center'>
                  <Loader2 className='my-24 h-6 w-6 animate-spin' />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Error loading pdf',
                  description: 'Please try again later',
                  variant: 'destructive',
                })
              }}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages)
              }}
              file={url}
              className='max-h-full'
            >
              {isLoading && renderedScale ? (
                <Page
                  scale={scale}
                  width={width ? width : 1}
                  pageNumber={currPage}
                  rotate={rotation}
                  key={'@' + renderedScale}
                />
              ) : null}

              <Page
                className={cn(isLoading ? 'hidden' : '')}
                scale={scale}
                width={width ? width : 1}
                pageNumber={currPage}
                rotate={rotation}
                key={'@' + scale}
                loading={
                  <div className='flex justify-center'>
                    <Loader2 className='my-24 h-6 w-6 animate-spin' />
                  </div>
                }
                onRenderSuccess={() => {
                  setRenderedScale(scale)
                }}
              />
            </Document>
          </div>
        </Simplebar>
      </div>
    </div>
  )
}

export default PdfRenderer
