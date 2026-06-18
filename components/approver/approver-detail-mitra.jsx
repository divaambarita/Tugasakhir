import { CardTitle, CardContent, CardHeader, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

function ApproverDetailMitra(rest) {
  return (
    <>
      <Card>
        <CardTitle>
          <CardHeader>
            <h3 className="mb-3 font-semibold leading-none tracking-tight">
              Infromasi Mitra
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-baseline space-x-2">
                <Label className="w-1/3">Nama Perusahaan*</Label>
                <div className="w-full">
                  <Input value={rest.akun.namaPerusahaan} disabled />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <Label className="w-1/3">E-Mail*</Label>
                <div className="w-full">
                  <Input value={rest.akun.email} disabled />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <Label className="w-1/3">Nomor Telepon*</Label>
                <div className="w-full">
                  <Input value={rest.akun.noTelp} disabled />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <Label className="w-1/3">Alamat*</Label>
                <div className="w-full">
                  <Input value={rest.akun.alamatPerusahaan} disabled />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <Label className="w-1/3">Provinsi*</Label>
                <div className="w-full">
                  <Input value={rest.akun.provinsi} disabled />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <Label className="w-1/3">Kabupaten / Kota *</Label>
                <div className="w-full">
                  <Input value={rest.akun.kabupatenKota} disabled />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <Label className="w-1/3">Kecamatan*</Label>
                <div className="w-full">
                  <Input value={rest.akun.kecamatan} disabled />
                </div>
              </div>
            </div>
          </CardContent>
        </CardTitle>
      </Card>
    </>
  );
}

export default ApproverDetailMitra;
