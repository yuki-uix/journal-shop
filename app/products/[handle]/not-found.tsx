import Link from 'next/link'

export default function ProductNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-zinc-900">商品未找到</h2>
      <p className="mt-2 text-zinc-500">
        该商品不存在或已下架，请浏览其他商品。
      </p>
      <Link
        href="/products"
        className="mt-6 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        浏览全部商品
      </Link>
    </div>
  )
}
