import { ImageEditor } from "@/components/image-editor"

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">New Generation</h1>
        <p className="text-muted-foreground">Create amazing images with our AI tools.</p>
      </div>
      <ImageEditor compact={true} />
    </div>
  )
}