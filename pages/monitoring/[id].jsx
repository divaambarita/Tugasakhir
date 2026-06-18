import Link from 'next/link'
import JenisSampahDataTable from '@/components/jenis-sampah/jenis-sampah-data-table'
import { useEffect, useState } from 'react'
import SearchInput from '@/components/custom_ui/search-input'
import TransaksiDataTable from '@/components/transaksi/transaksi-data-table'
import SesiTransaksiDataTable from '@/components/transaksi/sesi-transaksi-data-table'
import ChartSampahNasabah from '@/components/monitoring/nasabah/chart-sampah-nasabah'
import TableSampahPerDayNasabah from '@/components/monitoring/nasabah/table-sampah-per-day-nasabah'
import StatisticDataSampahNasabah from '@/components/monitoring/nasabah/statistic-data-sampah-nasabah'
import RankingTableSaldoNasabah from '@/components/monitoring/nasabah/ranking-table-saldo-nasabah'
import RankingTableSaldo from '@/components/monitoring/nasabah/ranking-table-saldo'
import { useRouter } from 'next/router'
import { Layout } from '@/components/layout/layout'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toaster } from '@/components/ui/toaster'

export default function MonitoringPage() {
  // const [cookies, setCookie, removeCookie] = useCookies(['currentUser'])
  const router = useRouter()
  const [id, setId] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (router.query.id) {
      setId(router.query.id)
    }
  }, [router.query])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  if (!id) {
    return <p>Loading...</p>
  }

  return (
    <Layout>
      <ScrollArea>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Filter:
            <select
              value={filter}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">Semua Tahun</option>
              <option value="current">Tahun Ini</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-1">
          <ChartSampahNasabah filter={filter} idNasabah={id} />
          <StatisticDataSampahNasabah filter={filter} idNasabah={id} />
          {/* <RankingTableSaldo />
          <RankingTableSaldoNasabah /> */}
        </div>
      </ScrollArea>
      <Toaster />
    </Layout>
  )
}
