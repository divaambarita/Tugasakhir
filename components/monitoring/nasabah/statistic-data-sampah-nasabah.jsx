import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const getColorForCategory = (category) => {
  const colors = {
    Plastik: '#FF6384',
    Logam: '#36A2EB',
    Kertas: '#FFCE56',
    Kaca: '#4BC0C0',
    B3: '#FF9F40',
    Karet: '#9966FF',
    Tekstil: '#C9CBCF',
    Elektronik: '#FF5733',
    Organik: '#28A745',
  }
  return colors[category] || '#000000'
}

const StatisticDataSampah = ({ filter, idNasabah }) => {
  const [chartData, setChartData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const idBsu = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/monitoring/sampah/nasabah/${idNasabah}`
        )
        const result = await response.json()
        if (result.success) {
          const { beratPerKategoriByMonthYear } = result.data
          const formattedData = {}
          const currentYear = new Date().getFullYear()

          Object.keys(beratPerKategoriByMonthYear).forEach((date) => {
            const [year] = date.split('-')
            if (
              filter === 'all' ||
              (filter === 'current' && parseInt(year) === currentYear)
            ) {
              const categories = beratPerKategoriByMonthYear[date]
              Object.keys(categories).forEach((category) => {
                if (category !== 'totalKeseluruhan') {
                  if (!formattedData[category]) {
                    formattedData[category] = {
                      labels: [],
                      datasets: [
                        {
                          label: category,
                          data: [],
                          borderColor: getColorForCategory(category),
                          fill: false,
                        },
                      ],
                    }
                  }
                  formattedData[category].labels.push(date)
                  formattedData[category].datasets[0].data.push(
                    categories[category]
                  )
                }
              })
            }
          })

          // Jika tidak ada data, tambahkan data kosong untuk setiap kategori
          const categories = [
            'Plastik',
            'Logam',
            'Kertas',
            'Kaca',
            'B3',
            'Karet',
            'Tekstil',
            'Elektronik',
            'Organik',
          ]
          categories.forEach((category) => {
            if (!formattedData[category]) {
              formattedData[category] = {
                labels: [],
                datasets: [
                  {
                    label: category,
                    data: [],
                    borderColor: getColorForCategory(category),
                    fill: false,
                  },
                ],
              }
            }
          })

          setChartData(formattedData)
        } else {
          throw new Error('Failed to fetch data')
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Fetch Error:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filter, idNasabah])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik Data Sampah</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(chartData).map((category) => (
              <div key={category} className="mb-4">
                <h3 className="text-lg font-semibold mb-2">{category}</h3>
                <Line data={chartData[category]} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StatisticDataSampah
