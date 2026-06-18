import { Card, CardContent } from "../ui/card";

function CustomCard({ title, value }) {
  return (
    <Card>
      <CardContent className="py-10 my-0">
        <div className="flex items-center w-full ">
          <p className="w-1/2 font-bold">{title}</p>
          <h1 className="w-1/2 text-2xl font-bold text-center">{value}</h1>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomCard;
