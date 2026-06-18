import { CardTitle, CardContent, CardHeader, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "../ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import RowForm from "../layout/row-form";

function ApproverDetailNasabah(rest) {
  return (
    <>
      <Card>
        <CardTitle>
          <CardHeader>
            <h3 className="mb-3 font-semibold leading-none tracking-tight">
              Infromasi Nasabah
            </h3>
          </CardHeader>
          <CardContent>
            <RowForm label={"Bank Sampah Uni*"}>
              <Input disabled />
            </RowForm>
            <Separator className="my-5" />
            <h3 className="mb-3 font-semibold leading-none tracking-tight">
              Data Pribadi
            </h3>
            <div className="space-y-3">
              <RowForm label={"Nama Perusahaa*"}>
                <Input value={rest.akun.namaPerusahaan} disabled />
              </RowForm>
              <RowForm label={"Nomor Telepon*"}>
                <Input value={rest.akun.noTelp} disabled />
              </RowForm>
              <RowForm label={"E-mail*"}>
                <Input value={rest.akun.email} disabled />
              </RowForm>
              <RowForm label={"Nomor Telepon*"}>
                <Input value={rest.akun.noTelp} disabled />
              </RowForm>
              <RowForm label={"Jenis Kelamin*"}>
                <RadioGroup
                  defaultValue={rest.akun.jenisKelamin}
                  className="flex items-center space-x-3"
                  disabled
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="Male" />
                    <Label>Laki-Laki</Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="Female" />
                    <Label>Perempuan</Label>
                  </div>
                </RadioGroup>
              </RowForm>
              <RowForm label={"Alamat*"}>
                <Input value={rest.akun.alamatPerusahaan} disabled />
              </RowForm>
              <RowForm label={"Provinsi*"}>
                <Input value={rest.akun.provinsi} disabled />
              </RowForm>
              <RowForm label={"Kabupaten / Kota *"}>
                <Input value={rest.akun.kabupatenKota} disabled />
              </RowForm>
              <RowForm label={"Kecamatan*"}>
                <Input value={rest.akun.kecamatan} disabled />
              </RowForm>
            </div>
          </CardContent>
        </CardTitle>
      </Card>
    </>
  );
}

export default ApproverDetailNasabah;
