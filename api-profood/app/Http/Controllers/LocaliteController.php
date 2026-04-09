<?php

namespace App\Http\Controllers;

use App\Models\Arrondissement;
use App\Models\Commune;
use App\Models\Departement;
use App\Models\Localite;
use Illuminate\Http\Request;

/**
 * 
 */
class LocaliteController extends Controller
{
    /**
     * Get localite by a given id.
     *
     * @param  integer  $localite_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLocalite($localite_id)
    {
        $localite = Localite::find($localite_id);

        if(!isset($localite)){
            return response()->json(['message' => 'Localité introuvable !'], 404);
        }
        return response()->json($localite, 200);
    }

    /**
     * Get all localites.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getLocalites(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // Pagination prevents performance issues with large numbers of locations
        $perPage = min($request->input('per_page', 20), 100);

        $localites = Localite::orderBy('wording')->paginate($perPage);

        return response()->json($localites, 200);
    }

    /**
     * Get localites by arrondissement.
     *
     * @param  integer  $arrondissement_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getLocalitesByArrondissement($arrondissement_id)
    {
        $arrondissement = Arrondissement::find($arrondissement_id);

        if(!isset($arrondissement)){
            return response()->json(['message' => 'Arrondissement introuvable !'], 404);
        }
        return response()->json($arrondissement->localites, 200);
    }

    /**
     * Get localites by commune.
     *
     * @param  integer  $commune_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getLocalitesByCommune($commune_id)
    {
        $commune = Commune::find($commune_id);

        if(!isset($commune)){
            return response()->json(['message' => 'Commune introuvable !'], 404);
        }
        return response()->json($commune->localites, 200);
    }

    /**
     * Get localites by departement.
     *
     * @param  integer  $departement_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getLocalitesByDepartement($departement_id)
    {
        $departement = Departement::find($departement_id);

        if(!isset($departement)){
            return response()->json(['message' => 'Département introuvable !'], 404);
        }
        return response()->json($departement->localites, 200);
    }

    /**
     * Get all localites with full location information.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getLocalitesWithFullInfo(Request $request)
    {
        // Calculate per_page with a default of 20 and maximum of 100
        // This method manually builds an array, so we implement pagination differently
        $perPage = min($request->input('per_page', 20), 100);
        $page = $request->input('page', 1);

        $localites = [];
        $communes = Commune::all();

        foreach($communes as $commune){
            foreach($commune->localites as $localite){
                // $arrondissement = ($localite->hasArrondissement()) ? ", {$localite->arrondissement->wording}" : '';
                $localites[] = [
                    'id'        => $localite->id,
                    'wording'   => "{$localite->wording}, {$localite->commune->wording}, {$localite->departement->wording}"
                    // 'wording'        => "{$localite->wording}, {$localite->commune->wording}{$arrondissement}"  . ", {$localite->departement->wording}"
                    // 'wording'        => $localite->wording . ', ' . $localite->commune->wording . $arrondissement . ', ' . $localite->departement->wording
                    // 'wording'           => $localite->wording,
                    // 'commune_wording'   => $localite->commune->wording
                ];
            }
        }

        // Manual pagination for the array
        $total = count($localites);
        $lastPage = (int)ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginatedData = array_slice($localites, $offset, $perPage);

        // Return Laravel-style pagination response for consistency with other endpoints
        return response()->json([
            'current_page' => $page,
            'data' => $paginatedData,
            'first_page_url' => url()->current() . '?page=1',
            'from' => $offset + 1,
            'last_page' => $lastPage,
            'last_page_url' => url()->current() . "?page={$lastPage}",
            'next_page_url' => $page < $lastPage ? url()->current() . '?page=' . ($page + 1) : null,
            'path' => url()->current(),
            'per_page' => $perPage,
            'prev_page_url' => $page > 1 ? url()->current() . '?page=' . ($page - 1) : null,
            'to' => min($offset + $perPage, $total),
            'total' => $total
        ], 200);
    }
}
