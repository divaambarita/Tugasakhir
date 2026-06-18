import { CardContent, CardHeader, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";

function ApproverDetailBsu(rest) {
  return (
    <>
      <Card>
        <CardHeader>
          <h3 className="mb-3 font-semibold leading-none tracking-tight">
            Infromasi Bank Sampah Unit (BSU)
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Nama Bank Sampah*</Label>
              <div className="w-full">
                <Input value={rest.akun.nama || ""} disabled />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">E-Mail*</Label>
              <div className="w-full">
                <Input value={rest.akun.email || ""} disabled />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Nomor Telepon*</Label>
              <div className="w-full">
                <Input value={rest.akun.noTelp || ""} disabled />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Alamat*</Label>
              <div className="w-full">
                <Input value={rest.akun.alamat || ""} disabled />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Kelurahan*</Label>
              <div className="w-full">
                <Input value={rest.akun.kelurahan || ""} disabled />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Kecamatan*</Label>
              <div className="w-full">
                <Input value={rest.akun.kecamatan || ""} disabled />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="mb-3 font-semibold leading-none tracking-tight">
            Hasil Survei Lokasi Bank Sampah
          </h3>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Lokasi*</Label>
              <div className="w-full">
                <Input
                  value={rest.akun.hasilverifikasi.lokasi || ""}
                  disabled
                />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Luas Tanah*</Label>
              <div className="w-full">
                <Input
                  value={rest.akun.hasilverifikasi.luasTempat || ""}
                  disabled
                />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Kondisi Bangunan*</Label>
              <div className="w-full">
                <Input
                  value={rest.akun.hasilverifikasi.kondisiBangunan || ""}
                  disabled
                />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Fasilitas*</Label>
              <div className="w-full">
                {/* jika fasilitas bertipe array maka menampilkan checkbox, jika tidak kosong */}
                {Array.isArray(rest.akun.hasilverifikasi.fasilitas) &&
                  rest.akun.hasilverifikasi.fasilitas.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-baseline space-x-2 space-y-5 "
                    >
                      <Checkbox
                        key={item.key}
                        label={item.nama}
                        checked={item.value}
                        disabled
                      />
                      <Label>{item.nama}</Label>
                    </div>
                  ))}
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3">Dokumentasi Kegiatan*</Label>
              <div className="w-full"></div>
            </div>
            <div className="flex items-baseline space-x-2">
              <Label className="w-1/3"></Label>
              <div className="w-full">
                <Card className="w-full max-w-xs">
                  <Image
                    src={rest.akun.hasilverifikasi.fotoKunjungan || ""}
                    width="400"
                    height="250"
                    alt="Product"
                    className="aspect-auto"
                  />
                </Card>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
}

export default ApproverDetailBsu;
