import {
  AspectedElement,
  PlanetAspectData,
} from "@/interfaces/AstroChartInterfaces";
import React, { useEffect, useRef, useState } from "react";
import {
  angularLabels,
  decimalToDegreesMinutes,
  extractHouseNumber,
  fixedNames,
  getArabicPartImage,
  getAspectImage,
  getDegreesInsideASign,
  getPlanetImage,
} from "../../utils/chartUtils";
import {
  BirthChart,
  Planet,
  PlanetType,
} from "@/interfaces/BirthChartInterfaces";
import { ArabicPartsType } from "@/interfaces/ArabicPartInterfaces";
import AspectTableFilterButton, {
  AspectFilterButtonImperativeHandle,
} from "./AspectTableFilterButton";
import {
  AspectDistance,
  AspectDistanceTypeInterface,
  TableFilterOptions,
  ElementFilterNode,
} from "@/interfaces/AspectTableInterfaces";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";
import Image from "next/image";
import InfoPopup from "./InfoPopup";
import { SkeletonTable } from "../skeletons";
import { SKELETON_LOADER_TIME } from "@/app/utils/constants";
import { useBirthChart } from "@/contexts/BirthChartContext";
import {
  getAspectAngleFromType,
  getTraditionalAspectOrbFromLongitudes,
  isApplyingByMotion,
} from "@/app/lib/aspectDynamics";

export default function AspectsTable({
  aspects,
  birthChart,
  outerChart,
  arabicParts,
  outerArabicParts,
  initialItemsPerPage,
  onItemsPerPageChanged,
}: {
  aspects: PlanetAspectData[];
  birthChart: BirthChart;
  outerChart?: BirthChart;
  arabicParts: ArabicPartsType;
  outerArabicParts?: ArabicPartsType;
  initialItemsPerPage?: number;
  onItemsPerPageChanged?: (newItemsPerPage: number) => void;
}) {
  const elementButtonRef = useRef<AspectFilterButtonImperativeHandle | null>(
    null
  );

  const aspectButtonRef = useRef<AspectFilterButtonImperativeHandle | null>(
    null
  );

  const aspectedElementButtonRef =
    useRef<AspectFilterButtonImperativeHandle | null>(null);

  const distanceButtonRef = useRef<AspectFilterButtonImperativeHandle | null>(
    null
  );

  const distanceTypeButtonRef =
    useRef<AspectFilterButtonImperativeHandle | null>(null);

  const backupValue = useRef(0);

  const [loading, setLoading] = useState(true);
  const [openInfoPopup, setOpenInfoPopup] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage ?? 5);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [tablePageCount, setTablePageCount] = useState(1);
  const [filteredAspects, setFilteredAspects] = useState<PlanetAspectData[]>(
    []
  );
  const [filterModalIsOpenArray, setFilterModalIsOpenArray] = useState([
    false, // Element
    false, // Aspect
    false, // Aspected
    false, // Distance
    false, // DistanceType
  ]);
  const [cumulatedOptions, setCumulatedOptions] =
    useState<TableFilterOptions>();

  const { isMobileBreakPoint } = useScreenDimensions();
  const { loadingNextChart, isMountingChart } = useBirthChart();

  const distanceValues: AspectDistance[] = [];
  const distanceTypes: AspectDistanceTypeInterface[] = [];

  const tdClasses =
    "w-full min-h-[2.75rem] border-r border-amber-200 px-2 py-2 flex flex-row items-center justify-center text-slate-800";

  const tdClasses3W4 =
    "w-3/4 min-h-[2.75rem] border-r border-amber-200 px-2 py-2 flex flex-row items-center justify-center text-slate-800";

  const tdClasses10W12 =
    "w-10/12 min-h-[2.75rem] border-r border-amber-200 px-2 py-2 flex flex-row items-center justify-center text-slate-800";

  useEffect(() => {
    clearFilters();

    setFilteredAspects(aspects.map((asp) => ({ ...asp } as PlanetAspectData)));

    setTimeout(() => {
      setLoading(false);
    }, SKELETON_LOADER_TIME);
  }, [aspects]);

  useEffect(() => {
    if (filteredAspects.length > 0) {
      updateTablePaginationAndPageCount();
    }
  }, [filteredAspects]);

  function getHouseName(element: AspectedElement): string {
    if (element.elementType !== "house") return "-";
    const houseNumber = extractHouseNumber(element.name)! + 1; // 0 - 11 to 1 - 12

    if ((houseNumber - 1) % 3 === 0) {
      return `${angularLabels[houseNumber - 1]}${element.isFromOuterChart ? "(E)" : ""
        }`;
    }

    return `C${houseNumber}${element.isFromOuterChart ? "(E)" : ""}`;
  }

  function getPlanetInfo(element: AspectedElement): Planet | undefined {
    const chart = element.isFromOuterChart ? outerChart : birthChart;

    return chart?.planets.find(
      (planet) => planet.type === (element.name as PlanetType)
    );
  }

  function getArabicPartKeyFromElement(
    element: AspectedElement
  ): keyof ArabicPartsType | undefined {
    const name = element.name
      .replace(`-${fixedNames.antiscionName}`, "")
      .replace(`${fixedNames.outerKeyPrefix}-`, "");

    const key = name as keyof ArabicPartsType;

    return key;
  }

  function getElementImage(element: AspectedElement): React.ReactNode {
    if (element.elementType === "planet") {
      return (
        <div className="w-full flex flex-row items-center justify-center">
          {getPlanetImage(element.name as PlanetType, {
            isAntiscion: element.isAntiscion,
            isRetrograde: element.isRetrograde,
          })}
          {element.isFromOuterChart ? "(E)" : ""}
        </div>
      );
    }

    if (element.elementType === "arabicPart" && arabicParts) {
      const key = getArabicPartKeyFromElement(element)!;
      const arabicPart = arabicParts[key];
      if (arabicPart) {
        return (
          <div className="w-full flex flex-row items-center justify-center">
            {getArabicPartImage(arabicPart, {
              isAntiscion: element.isAntiscion,
            })}
            {element.isFromOuterChart ? "(E)" : ""}
          </div>
        );
      }
    }

    if (element.elementType === "house") {
      return getHouseName(element);
    }

    if (element.elementType === "fixedStar") {
      return <Image alt="stars" src="/stars.png" width={40} height={40} />;
    }

    return <span className="text-sm">{element.name}</span>;
  }

  function getElementRawLongitude(element: AspectedElement): number {
    let rawLongitude = 0;

    const chart = element.isFromOuterChart ? outerChart : birthChart;
    const lots = element.isFromOuterChart ? outerArabicParts : arabicParts;

    if (element.elementType === "planet") {
      const originalElement = getPlanetInfo(element);

      if (originalElement) {
        backupValue.current = element.isAntiscion
          ? originalElement.antiscionRaw
          : originalElement.longitudeRaw;
      }
    } else if (element.elementType === "house") {
      const houseIndex = extractHouseNumber(element.name)! + 1;

      if (chart) {
        const index = houseIndex - 1;
        backupValue.current = chart.housesData.house[index];
      }
    } else if (element.elementType === "arabicPart") {
      const key = getArabicPartKeyFromElement(element)!;
      if (lots) {
        const originalArabicPart = lots[key];

        if (originalArabicPart) {
          backupValue.current = element.isAntiscion
            ? originalArabicPart.antiscionRaw
            : originalArabicPart.longitudeRaw;
        }
      }
    }

    rawLongitude = backupValue.current;
    backupValue.current = 0;

    return rawLongitude;
  }

  function getAspectDistance(aspect: PlanetAspectData): string {
    const _1stElementRawLongitude = getElementRawLongitude(aspect.element);
    const _2ndElementRawLongitude =
      aspect.aspectedElement.elementType === "fixedStar"
        ? aspect.aspectedElement.longitude
        : getElementRawLongitude(aspect.aspectedElement);
    const numericDistance = Number.parseFloat(
      decimalToDegreesMinutes(
        getTraditionalAspectOrbFromLongitudes(
          _1stElementRawLongitude,
          _2ndElementRawLongitude,
          aspect.aspectType
        )
      ).toFixed(2)
    );

    distanceValues.push({ key: aspect.key, distance: numericDistance });

    const distance = numericDistance.toString();

    const parts = distance.split(".");
    const deg = parts[0];
    let min = parts[1];

    if (min && min.length === 1) {
      min = min + "0";
    }

    return `${deg}°${min ?? "00"}'`;
  }

  function getElementLongitudeSpeed(element: AspectedElement): number {
    if (element.elementType !== "planet") {
      return 0;
    }

    const planetInfo = getPlanetInfo(element);
    const speed = planetInfo?.longitudeSpeed ?? 0;

    return element.isAntiscion ? -speed : speed;
  }

  function getAspectDistanceType(aspect: PlanetAspectData): string {
    const applicative = "A";
    const separative = "S";
    const result = isApplyingByMotion({
      firstLongitude: getElementRawLongitude(aspect.element),
      firstSpeed: getElementLongitudeSpeed(aspect.element),
      secondLongitude:
        aspect.aspectedElement.elementType === "fixedStar"
          ? aspect.aspectedElement.longitude
          : getElementRawLongitude(aspect.aspectedElement),
      secondSpeed: getElementLongitudeSpeed(aspect.aspectedElement),
      aspectAngle: getAspectAngleFromType(aspect.aspectType),
    })
      ? applicative
      : separative;

    distanceTypes.push({
      key: aspect.key,
      type: result,
    });

    return result;
  }

  function updateTablePaginationAndPageCount() {
    let newPageCount = Math.floor(filteredAspects.length / itemsPerPage);
    newPageCount += filteredAspects.length % itemsPerPage > 0 ? 1 : 0;

    const newCurrentPage =
      newPageCount > tablePageCount ? tablePageCount : newPageCount;
    setTablePageCount(newPageCount);
    setTableCurrentPage(newCurrentPage);
  }

  function updateTablePageCount(newItemsPerPage: number) {
    let pageCount = Math.floor(filteredAspects.length / newItemsPerPage);
    pageCount += filteredAspects.length % newItemsPerPage > 0 ? 1 : 0;
    setTablePageCount(pageCount);
  }

  function getLastRowItemCount(): number {
    return filteredAspects.length - (tableCurrentPage - 1) * itemsPerPage;
  }

  function isLastPage(): boolean {
    return tableCurrentPage === tablePageCount;
  }

  function updateTableItemsPerPage(newItemsPerPage: number) {
    setItemsPerPage(newItemsPerPage);
    updateTablePageCount(newItemsPerPage);

    if (newItemsPerPage === itemsPerPage) return;

    let currentItemsShown = 0;
    let newTableCurrentPage = 0;

    if (newItemsPerPage > itemsPerPage) {
      currentItemsShown = tableCurrentPage * itemsPerPage;
    }

    const lastRowItemCount = getLastRowItemCount();

    currentItemsShown = isLastPage()
      ? itemsPerPage * (tableCurrentPage - 1) + lastRowItemCount
      : itemsPerPage;

    newTableCurrentPage = Math.floor(currentItemsShown / newItemsPerPage);
    newTableCurrentPage += currentItemsShown % newItemsPerPage > 0 ? 1 : 0;

    setTableCurrentPage(newTableCurrentPage);

    onItemsPerPageChanged?.(newItemsPerPage);
  }

  function updateTableCurrentPage(direction: number) {
    if (direction < 0) {
      setTableCurrentPage((prev) => Math.max(1, prev + direction));
    } else {
      setTableCurrentPage((prev) => Math.min(prev + direction, tablePageCount));
    }
  }

  function getEmptyTableRows(): React.ReactNode {
    const lastRowItemCount = getLastRowItemCount();
    const emptyRowsCount = itemsPerPage - lastRowItemCount;
    const rows: React.ReactNode[] = [];

    for (let index = 0; index < emptyRowsCount; index++) {
      const trClasses = `flex flex-row border-t border-amber-100 ${index > 0 ? "border-[#f5ede0]" : ""
        }`;
      rows.push(
        <tr key={index} className={trClasses}>
          <td>&nbsp;</td>
        </tr>
      );
    }

    return rows;
  }

  function getColumnAspectedElements(
    column: "element" | "aspectedElement"
  ): AspectedElement[] {
    let elements: AspectedElement[] = [];

    if (column === "element") {
      elements = filteredAspects.map((aspect) => {
        return aspect.element;
      });
    } else if (column === "aspectedElement") {
      elements = filteredAspects.map((aspect) => {
        return aspect.aspectedElement;
      });
    }

    return elements;
  }

  const toggleFilterModalOpeningArray = (modalIndex: number) =>
    filterModalIsOpenArray.map((filterIsOpen, index) => {
      if (index === modalIndex) return !filterIsOpen;
      else return filterIsOpen;
    });

  function toggleFilterModalOpening(modalIndex: number) {
    let newArrayData = toggleFilterModalOpeningArray(modalIndex);

    const hasOtherModalOpen = newArrayData.some(
      (filterIsOpen, index) => modalIndex !== index && filterIsOpen
    );

    if (newArrayData[modalIndex] && !hasOtherModalOpen) {
      setFilterModalIsOpenArray(newArrayData);
    } else if (!newArrayData[modalIndex]) {
      newArrayData = toggleFilterModalOpeningArray(modalIndex); // Reseting modal opening to false
      setFilterModalIsOpenArray(newArrayData);
    }
  }

  function disableFilter(modalIndex: number): boolean {
    const hasOtherModalOpen = filterModalIsOpenArray.some(
      (filterIsOpen, index) => modalIndex !== index && filterIsOpen
    );

    return hasOtherModalOpen;
  }

  function elementNodeArrayContainsAspectElement(
    array: ElementFilterNode[],
    element: AspectedElement
  ): boolean {
    // array.forEach((node) => {
    //   console.log(`element type: ${node.elementType} x ${element.elementType}
    //     \nname: ${node.name} x ${element.name}
    //     \nisantiscion: ${node.isAntiscion} x ${element.isAntiscion}
    //     \nisFromOuterchart: ${node.isFromOuterChart} x ${element.isFromOuterChart}`);
    // });

    return array.some(
      (node) =>
        node.elementType === element.elementType &&
        (element.elementType !== "fixedStar"
          ? node.name === element.name
          : true) &&
        node.isAntiscion === element.isAntiscion &&
        node.isFromOuterChart === element.isFromOuterChart
    );
  }

  function handleOnConfirmFilter(options?: TableFilterOptions) {
    const optionsToCheck: TableFilterOptions | undefined = {
      ...cumulatedOptions,
      ...options,
    };

    let array: PlanetAspectData[] = [...aspects];

    if (optionsToCheck?.elementsFilter) {
      const elements = optionsToCheck.elementsFilter.elements
        .filter((el) => el.isChecked)
        .map((el) => el.element);

      array = array.filter((aspect) =>
        elementNodeArrayContainsAspectElement(elements, aspect.element)
      );

      setCumulatedOptions((prev) => ({
        ...prev,
        elementsFilter: optionsToCheck.elementsFilter,
      }));
    }

    if (optionsToCheck?.aspectsFilter) {
      const cb = optionsToCheck.aspectsFilter.checkboxesStates;
      const checkedAspects = new Set(
        cb.filter((c) => c.isChecked).map((c) => c.aspect)
      );

      array = aspects.filter((asp) => checkedAspects.has(asp.aspectType));

      setCumulatedOptions((prev) => ({
        ...prev,
        aspectsFilter: optionsToCheck.aspectsFilter,
      }));
    }

    if (optionsToCheck?.aspectedElementsFilter) {
      const elements = optionsToCheck.aspectedElementsFilter.elements
        .filter((el) => el.isChecked)
        .map((el) => el.element);

      array = array.filter((aspect) =>
        elementNodeArrayContainsAspectElement(elements, aspect.aspectedElement)
      );

      // console.log(array, elements);
      setCumulatedOptions((prev) => ({
        ...prev,
        aspectedElementsFilter: optionsToCheck.aspectedElementsFilter,
      }));
    }

    if (optionsToCheck?.distanceFilter) {
      const options = optionsToCheck.distanceFilter.distanceOptions;
      const fnToCheck = (val: number): boolean => {
        let result =
          options.lowerLimitFilterFunc?.(val, options.lowerLimitValue) ?? true;

        if (result)
          result =
            options.upperLimitFilterFunc?.(val, options.upperLimitValue) ??
            true;

        return result;
      };

      array = array.filter((asp) => {
        const rawDistance = getAspectDistance(asp)
          .replace("°", ".")
          .replace("'", "");
        const numericValue = Number.parseFloat(rawDistance);

        return fnToCheck(numericValue);
      });

      setCumulatedOptions((prev) => ({
        ...prev,
        distanceFilter: { ...optionsToCheck.distanceFilter! },
      }));
    }

    if (optionsToCheck?.distanceTypesFilter) {
      const cb = optionsToCheck.distanceTypesFilter.distanceTypes;
      const checkedAspects = new Set(
        cb.filter((c) => c.isChecked).map((c) => c.distanceType)
      );

      array = array.filter((asp) =>
        checkedAspects.has(
          getAspectDistanceType(asp) === "A" ? "applicative" : "separative"
        )
      );

      setCumulatedOptions((prev) => ({
        ...prev,
        distanceTypesFilter: optionsToCheck.distanceTypesFilter,
      }));
    }

    setFilteredAspects(array.map((asp) => ({ ...asp })));
  }

  function clearFilters() {
    elementButtonRef.current?.clearFilter();
    aspectButtonRef.current?.clearFilter();
    aspectedElementButtonRef.current?.clearFilter();
    distanceButtonRef?.current?.clearFilter();
    distanceTypeButtonRef.current?.clearFilter();

    setFilteredAspects([...aspects]);
    setCumulatedOptions(undefined);
  }

  if (loading || loadingNextChart || isMountingChart) {
    return (
      <div className="w-full">
        <SkeletonTable rows={12} />
      </div>
    );
  }

  return (
    <>
        <div className="mb-3 flex w-full items-center justify-between gap-3">
          <div>
            <p className="section-eyebrow text-[0.62rem]!">Leitura Visual</p>
            <h2 className="text-lg font-bold text-slate-900 md:text-xl">Aspectos</h2>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-white shadow-sm transition-transform hover:scale-105 hover:bg-amber-50"
            onClick={() => setOpenInfoPopup((prev) => !prev)}
            aria-label="Abrir legenda"
          >
            <Image
              alt="info"
              src="/info.png"
              width={18}
              height={18}
              unoptimized
            />
          </button>
        </div>

        {openInfoPopup && (
          <div className="relative mb-4 w-full">
            <InfoPopup />
          </div>
        )}

        <table className="flex w-full flex-col overflow-visible rounded-[1.6rem] border border-amber-200 bg-[#fffdfa] text-center text-[0.75rem] text-slate-800 shadow-[0_18px_45px_rgba(0,0,0,0.08)] md:text-sm">
          <thead className="overflow-hidden rounded-t-[1.6rem] bg-[linear-gradient(180deg,#fffaf0_0%,#f6ead5_100%)]">
            <tr className="flex flex-row justify-between border-b border-amber-200 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-700 md:text-[0.76rem]">
              <th className="w-3/4 border-r border-amber-200 px-2 py-3 text-center">Elemento</th>
              <th className="w-3/4 border-r border-amber-200 px-2 py-3 text-center">Aspecto</th>
              <th className="w-full border-r border-amber-200 px-2 py-3 text-center">Aspectado</th>
              <th className="w-10/12 text-center border-r-2">Distância</th>
              <th className="w-1/2 text-center">Tipo</th>
            </tr>
            <tr className="flex flex-row items-center justify-between border-t border-amber-100 bg-white/70">
              <th className="h-full w-3/4 border-r border-amber-200 text-center text-[0.85rem]">
                <AspectTableFilterButton
                  ref={elementButtonRef}
                  type="element"
                  openModal={filterModalIsOpenArray[0]}
                  modalIndex={0}
                  disableFilterBtn={disableFilter(0)}
                  elements={getColumnAspectedElements("element")}
                  onModalButtonClick={toggleFilterModalOpening}
                  onConfirm={handleOnConfirmFilter}
                  getElementImage={getElementImage}
                />
              </th>
              <th className="w-3/4 border-r border-amber-200 text-center">
                <AspectTableFilterButton
                  ref={aspectButtonRef}
                  type="aspect"
                  openModal={filterModalIsOpenArray[1]}
                  modalIndex={1}
                  disableFilterBtn={disableFilter(1)}
                  onModalButtonClick={toggleFilterModalOpening}
                  onConfirm={handleOnConfirmFilter}
                />
              </th>
              <th className="w-full border-r border-amber-200 text-center">
                <AspectTableFilterButton
                  ref={aspectedElementButtonRef}
                  type="aspectedElement"
                  openModal={filterModalIsOpenArray[2]}
                  modalIndex={2}
                  disableFilterBtn={disableFilter(2)}
                  elements={getColumnAspectedElements("aspectedElement")}
                  onModalButtonClick={toggleFilterModalOpening}
                  onConfirm={handleOnConfirmFilter}
                  getElementImage={getElementImage}
                />
              </th>
              <th className="w-10/12 border-r border-amber-200 text-center">
                <AspectTableFilterButton
                  ref={distanceButtonRef}
                  type="distance"
                  openModal={filterModalIsOpenArray[3]}
                  modalIndex={3}
                  disableFilterBtn={disableFilter(3)}
                  onModalButtonClick={toggleFilterModalOpening}
                  onConfirm={handleOnConfirmFilter}
                />
              </th>
              <th className="w-1/2 text-center">
                <AspectTableFilterButton
                  ref={distanceTypeButtonRef}
                  type="aspectDistanceType"
                  openModal={filterModalIsOpenArray[4]}
                  modalIndex={4}
                  disableFilterBtn={disableFilter(4)}
                  distanceTypes={distanceTypes}
                  onModalButtonClick={toggleFilterModalOpening}
                  onConfirm={handleOnConfirmFilter}
                />
              </th>
            </tr>
          </thead>
          {filteredAspects && filteredAspects.length > 0 && (
            <tbody className="flex flex-col border-b border-amber-200 bg-white">
              {filteredAspects
                .filter(
                  (_, index) =>
                    index >= itemsPerPage * (tableCurrentPage - 1) &&
                    index < itemsPerPage * tableCurrentPage
                )
                .map((aspect, index) => {
                  return (
                    <tr className="flex flex-row border-t border-amber-100 even:bg-amber-50/30" key={index}>
                      <td className={tdClasses3W4}>
                        {getElementImage(aspect.element)}
                      </td>
                      <td className={tdClasses3W4}>
                        {getAspectImage(aspect.aspectType)}
                      </td>
                      {aspect.aspectedElement.elementType !== "fixedStar" && (
                        <td className={tdClasses}>
                          {getElementImage(aspect.aspectedElement)}
                        </td>
                      )}

                      {aspect.aspectedElement.elementType === "fixedStar" && (
                        <td className={tdClasses}>
                          <div
                            className={
                              "flex w-full flex-row items-center gap-1 break-words pl-1 text-[0.65rem] font-bold md:text-[0.7rem]"
                            }
                          >
                            <Image
                              alt="star"
                              src={aspect.aspectedElement.isRelevant ? "/table-relevant-star.png" : "/star.png"}
                              width={10}
                              height={10}
                            />
                            <span className={aspect.aspectedElement.isRelevant ? 'text-[#4015fa]' : 'text-black'}>{aspect.aspectedElement.name}</span>
                          </div>
                        </td>
                      )}

                      <td className={tdClasses10W12}>
                        {getAspectDistance(aspect)}
                      </td>
                      <td className="w-1/2 min-h-[2.75rem] px-2 py-2 flex flex-row items-center justify-center text-slate-800">
                        {getAspectDistanceType(aspect)}
                      </td>
                    </tr>
                  );
                })}

              {getEmptyTableRows()}
            </tbody>
          )}

          {(filteredAspects === undefined || filteredAspects.length === 0) && (
            <tbody className="flex flex-col border-y border-amber-200 bg-white">
              <tr className="flex flex-row">
                <td className="w-full px-3 py-6 text-slate-700">Nenhum aspecto encontrado.</td>
              </tr>
            </tbody>
          )}
          <tfoot className="flex flex-row items-center justify-around border-t border-amber-200 bg-[#f9f2e6] p-3 font-semibold text-slate-700">
            <tr className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <td className="flex w-full flex-row items-center gap-2 text-start md:w-auto md:text-center">
                {isMobileBreakPoint() && <span>Ítens</span>}
                {!isMobileBreakPoint() && (
                  <span className="w-full text-nowrap">Ítens por página</span>
                )}

                <select
                  value={itemsPerPage}
                  className="w-auto rounded-full border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm"
                  onChange={(e) => {
                    updateTableItemsPerPage(Number.parseInt(e.target.value));
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </td>

              <td className="flex w-full flex-row items-center justify-between gap-3 md:w-auto md:justify-end">
                <div className="flex flex-row items-center gap-3">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-white shadow-sm transition-colors hover:bg-amber-50"
                    onClick={() => clearFilters()}
                    title="Limpar filtros"
                  >
                    <Image
                      alt="trash-can"
                      src="/trash.png"
                      width={15}
                      height={15}
                      unoptimized
                    />
                  </button>

                  <div className="text-sm tracking-tight text-slate-700">
                    {tableCurrentPage}/{tablePageCount}
                  </div>
                </div>

                <div className="flex w-fit flex-row items-center justify-between gap-2">
                  <button
                    className="min-w-[2.35rem] rounded-full border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors hover:bg-amber-50 active:bg-amber-100"
                    onClick={() => updateTableCurrentPage(-999)}
                  >
                    |◀
                  </button>
                  <button
                    className="min-w-[2.35rem] rounded-full border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors hover:bg-amber-50 active:bg-amber-100"
                    onClick={() => updateTableCurrentPage(-1)}
                  >
                    ◀
                  </button>
                  <button
                    className="min-w-[2.35rem] rounded-full border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors hover:bg-amber-50 active:bg-amber-100"
                    onClick={() => updateTableCurrentPage(1)}
                  >
                    ▶
                  </button>
                  <button
                    className="min-w-[2.35rem] rounded-full border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition-colors hover:bg-amber-50 active:bg-amber-100"
                    onClick={() => updateTableCurrentPage(999)}
                  >
                    ▶|
                  </button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </>
  );
}
