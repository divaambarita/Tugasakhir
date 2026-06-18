import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/toaster'
import BackButton from '@/components/custom_ui/back-button'
import PenarikanSaldoForm from '@/components/penarikan-saldo/penarikan-saldo-form'
// import NasabahForm from "@/components/nasabah/nasabah-form";
// import PenarikanForm from "@/components/saldo/saldo-form";

// export async function getServerSideProps(context) {
//   /// mengambil id dari query /survey/add-survey/[id]
// //   const idBsu = context?.query?.id;
// //   return {
// //     props: {
// //       idBsu,
// //     },
// //   };

// }

function AddPenarikanSaldo() {
  return (
    <Layout>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Form Penarikan Saldo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackButton />
          <PenarikanSaldoForm />
        </CardContent>
      </Card>
      <Toaster />
    </Layout>
  )
}

export default AddPenarikanSaldo