import { HistoryGallery } from "@/components/dashboard/history-gallery"

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6">Generation History</h1>
      <HistoryGallery />
    </div>
  )
}
