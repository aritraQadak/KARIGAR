export function historyCounts(products) {
  return {published:products.length,analyzed:products.filter(p=>p.evidence&&Number.isFinite(p.evidence.score)).length,
    process:products.filter(p=>p.media?.processVideo).length,
    live:products.filter(p=>p.media?.processVideo&&p.media.processSource==='live_capture'&&p.evidence?.live_capture).length};
}
