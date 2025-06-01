import Image from "next/image";

function Header() {
  return (
    <nav className="flex justify-between pl-4 pr-8 h-[64px] bg-gray-50 items-center">
      <div className="flex items-center m-3">
        <Image
          className="mx-4"
          src="/finallogoround.png"
          alt="l"
          width={35}
          height={35}
          priority
        />
        <p className="text-gray-700 text-lg font-bold tracking-tightest font-sans">
          R.E.A.C.H
        </p>
      </div>
      <div className="flex items-center justify-between w-100">
        <div className="flex items-center justify-between w-55 m-1">
          <div className="text-gray-600 p-3 px-6 text-sm tracking-wider font-semibold hover:bg-neutral-300 hover:rounded-md hover:shadow-md cursor-pointer">
            Map
          </div>
          <div className="text-gray-600 p-3 px-4 text-sm tracking-wider font-semibold hover:bg-gray-300 hover:rounded-md hover:shadow-md cursor-pointer">
            Guidelines
          </div>
        </div>
        <Image
          className="rounded-lg m-2"
          src="/pfp.png"
          alt="l"
          width={30}
          height={30}
        />
      </div>
    </nav>
  );
}

export default Header;
